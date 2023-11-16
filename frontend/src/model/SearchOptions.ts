import { SfDatabase, Stamp } from 'api/SfDatabase';
import _ from 'lodash';
import { NumberRange, zNumberRange, zNumberRangeWithSwitch } from './NumberRange';
import z from 'zod';
import { zNullableInputString } from './utility.ts';
import { useMemo } from 'react';
import { useFieldArray, UseFieldArrayReturn, useForm, UseFormReturn } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { StampAvailabilityRequirement } from './StampAvailabilityRequirement.ts';

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

export class SearchOptions {
  static Default = new SearchOptions(
    new NumberRange(null, null),
    new NumberRange(1998, null),
    null,
    StampAvailabilityRequirement.NO_REQUIREMENT,
    '',
    new StampSort(StampField.Id, SortOrder.Desc),
  );
  static DefaultAsStringMap = SearchOptions.Default.asStringMap();

  constructor(
    readonly value: NumberRange,
    readonly year: NumberRange,
    readonly category: string | null,
    readonly availabilityRequirement: StampAvailabilityRequirement,
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
      this.availabilityRequirement.matches(s) &&
      (this.category === null || s.categories.includes(this.category)) &&
      (this.contains.length === 0 || s.idNameAndSeries.indexOf(this.contains.toLowerCase()) >= 0)
    );
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
      StampAvailabilityRequirement.decodeFromString(stringMap['available']),
      stringMap['contains'],
      StampSort.fromString(stringMap['sort']),
    );
  }

  asStringMap(): Record<string, string> {
    return {
      value: this.value.toString(),
      year: this.year.toString(),
      category: this.category ?? '',
      available: this.availabilityRequirement.encodeToString(),
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
      shops: this.availabilityRequirement.toFormData(db.shops),
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
    return new SearchOptions(
      val.valueRange,
      val.yearRange,
      val.category,
      StampAvailabilityRequirement.fromFormData(val.shops),
      val.nameQuery,
      new StampSort(val.sort.fieldId, val.sort.direction),
    );
  });
export type SearchOptionsFormData = z.input<typeof zSearchOptions>;
export type SearchFormHandle = {
  context: UseFormReturn<SearchOptionsFormData>;
  shopFieldArray: UseFieldArrayReturn<SearchOptionsFormData, 'shops'>;
};

export function useSearchOptionsForm(db: SfDatabase, defaultOptions: SearchOptions): SearchFormHandle {
  const defaultFormData = useMemo(() => defaultOptions.toFormData(db), [defaultOptions, db]);
  const context = useForm({
    defaultValues: defaultFormData,
    mode: 'all',
    resolver: zodResolver(zSearchOptions),
    criteriaMode: 'all',
  });
  const shopFieldArray = useFieldArray({ name: 'shops', control: context.control });
  return { context, shopFieldArray };
}
