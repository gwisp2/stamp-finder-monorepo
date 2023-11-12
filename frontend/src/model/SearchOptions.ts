import { Item, SfDatabase, Stamp } from 'api/SfDatabase';
import _ from 'lodash';
import { NumberRange, zNumberRange, zNumberRangeWithSwitch } from './NumberRange';
import z from 'zod';
import { zNullableInputString } from './utility.ts';
import { FormHandle } from '../components/FormHandle.ts';
import { useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

export class StampField {
  static Id = new StampField('id', 'По номеру', (s) => s.id);
  static Value = new StampField('value', 'По номиналу', (s) => s.value);
  static BoxArea = new StampField('boxarea', 'По занимаемому месту', (s) => s.shape?.bboxArea ?? null);
  static Width = new StampField('width', 'По ширине', (s) => s.shape?.width ?? null);
  static AllValues = [StampField.Id, StampField.Value, StampField.BoxArea, StampField.Width];

  private constructor(
    public readonly id: string,
    public readonly displayName: string,
    public readonly extractValue: (s: Stamp) => number | null,
  ) {}

  toString() {
    return this.id;
  }

  static fromString(id: string): StampField {
    const field = StampField.AllValues.find((f) => f.id === id);
    if (!field) {
      throw new Error(`Invalid id: ${id}`);
    }
    return field;
  }
}

export class SortOrder {
  static Asc = new SortOrder('asc');
  static Desc = new SortOrder('desc');

  private constructor(public readonly id: 'asc' | 'desc') {}

  reverse() {
    return this === SortOrder.Asc ? SortOrder.Desc : SortOrder.Asc;
  }

  toString() {
    return this.id;
  }

  static fromString(id: string): SortOrder {
    switch (id) {
      case SortOrder.Asc.id:
        return SortOrder.Asc;
      case SortOrder.Desc.id:
        return SortOrder.Desc;
      default:
        throw new Error('Invalid id');
    }
  }
}

export class StampSort {
  constructor(
    readonly field: StampField,
    readonly order: SortOrder,
  ) {}

  toString(): string {
    return `${this.field}-${this.order}`;
  }

  static fromString(str: string): StampSort {
    const sortParts = str.split('-');
    const field = sortParts[0];
    const order = sortParts[1];
    return new StampSort(StampField.fromString(field), SortOrder.fromString(order));
  }

  compare(a: Stamp, b: Stamp): number {
    const aValue = this.field.extractValue(a);
    const bValue = this.field.extractValue(b);
    if (aValue !== null && bValue !== null) {
      const cmp = aValue > bValue ? -1 : aValue === bValue ? 0 : 1;
      return this.reverseMultiplier() * cmp;
    } else if (aValue !== null) {
      // nulls are last
      return -1;
    } else if (bValue !== null) {
      // nulls are last
      return 1;
    } else {
      // both are null
      return 0;
    }
  }

  private reverseMultiplier(): number {
    return this.order === SortOrder.Desc ? 1 : -1;
  }
}

export const ANY = 'any';
export type ShopRequirement = string[] | typeof ANY;

export class SearchOptions {
  static Default = new SearchOptions(
    new NumberRange(null, null),
    new NumberRange(1998, null),
    null,
    [],
    '',
    new StampSort(StampField.Id, SortOrder.Desc),
  );
  static DefaultAsStringMap = SearchOptions.Default.asStringMap();

  constructor(
    readonly value: NumberRange,
    readonly year: NumberRange,
    readonly category: string | null,
    readonly availabilityRequired: ShopRequirement,
    readonly contains: string,
    readonly sort: StampSort,
  ) {}

  filterAndSort(stamps: Stamp[]): Stamp[] {
    return stamps.filter((s) => this.matches(s)).sort((a, b) => this.sort.compare(a, b));
  }

  matches(s: Stamp): boolean {
    return (
      this.year.contains(s.year) &&
      this.value.contains(s.value) &&
      this.availabilityMatches(s.shopItems) &&
      (this.category === null || s.categories.includes(this.category)) &&
      (this.contains.length === 0 || s.idNameAndSeries.indexOf(this.contains.toLowerCase()) >= 0)
    );
  }

  private availabilityMatches(shopItems: Item[]): boolean {
    if (this.availabilityRequired === ANY) {
      return shopItems.length !== 0;
    } else if (this.availabilityRequired.length === 0) {
      return true;
    } else {
      return _.some(shopItems, (item) => _.includes(this.availabilityRequired || [], item.shop.id));
    }
  }

  static fromUrlParams(params: URLSearchParams): SearchOptions {
    const stringMap = _.clone(this.DefaultAsStringMap);
    for (const [k, v] of params.entries()) {
      stringMap[k] = v;
    }
    return new SearchOptions(
      NumberRange.fromString(stringMap['value']),
      NumberRange.fromString(stringMap['year']),
      stringMap['category'] ? stringMap['category'] : null,
      SearchOptions.parseListOfShopsFromString(stringMap['available']),
      stringMap['contains'],
      StampSort.fromString(stringMap['sort']),
    );
  }

  private static parseListOfShopsFromString(str: string): string[] | typeof ANY {
    if (str === ANY) {
      return ANY;
    } else if (!str) {
      return [];
    }
    return str.split(',');
  }

  asStringMap(): Record<string, string> {
    return {
      value: this.value.toString(),
      year: this.year.toString(),
      category: this.category ?? '',
      available: this.availabilityRequired === ANY ? ANY : this.availabilityRequired.join(','),
      sort: this.sort.toString(),
      contains: this.contains,
    };
  }

  toUrlParams(): URLSearchParams {
    const params = new URLSearchParams();
    for (const [k, v] of Object.entries(this.asStringMap())) {
      if (!_.isEqual(SearchOptions.DefaultAsStringMap[k], v)) {
        params.set(k, v);
      }
    }
    return params;
  }

  toUrlSearchString(): string {
    return this.toUrlParams().toString();
  }

  toFormData(db: SfDatabase): SearchOptionsFormData {
    return {
      valueRange: this.value.toFormValuesWithSwitch(),
      yearRange: this.year.toFormValues(),
      nameQuery: this.contains,
      category: this.category ?? '',
      shops: db.shops.map((shop) => ({
        shopId: shop.id,
        displayLabel: `${shop.displayName} [${shop.reportDate}]`,
        selected: this.availabilityRequired === ANY || (this.availabilityRequired?.includes(shop.id) ?? false),
      })),
      sort: {
        fieldId: this.sort.field.id,
        direction: this.sort.order.id,
      },
    };
  }
}

// zSearchOptions is a zod schema that transforms form data to SearchOptions object
export const zSearchOptions = z
  .strictObject({
    valueRange: zNumberRangeWithSwitch,
    yearRange: zNumberRange,
    nameQuery: z.string(),
    category: zNullableInputString,
    shops: z.array(
      z.strictObject({
        shopId: z.string(),
        displayLabel: z.string(),
        selected: z.boolean(),
      }),
    ),
    sort: z.strictObject({
      fieldId: z.string().transform((v) => StampField.fromString(v)),
      direction: z.union([z.literal('asc'), z.literal('desc')]).transform((v) => SortOrder.fromString(v)),
    }),
  })
  .transform((val) => {
    const selectedShops = val.shops.filter((s) => s.selected);
    let shopRequirement: ShopRequirement = selectedShops.map((s) => s.shopId);
    if (shopRequirement.length === val.shops.length) {
      shopRequirement = ANY;
    }
    return new SearchOptions(
      val.valueRange,
      val.yearRange,
      val.category,
      shopRequirement,
      val.nameQuery,
      new StampSort(val.sort.fieldId, val.sort.direction),
    );
  });
export type SearchOptionsFormData = z.input<typeof zSearchOptions>;

export function useSearchOptionsForm(
  db: SfDatabase,
  defaultOptions: SearchOptions,
): FormHandle<z.input<typeof zSearchOptions>> {
  const defaultFormData = useMemo(() => defaultOptions.toFormData(db), [defaultOptions, db]);
  return useForm({
    defaultValues: defaultFormData,
    mode: 'all',
    resolver: zodResolver(zSearchOptions),
    criteriaMode: 'all',
  });
}
