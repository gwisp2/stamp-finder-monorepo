import { Item, Stamp } from 'api/SfDatabase';
import _ from 'lodash';
import { NumberRange } from './NumberRange';

export class StampField {
  static Id = new StampField('id', 'По номеру', (s) => s.id);
  static Value = new StampField('value', 'По номиналу', (s) => s.value);
  static AllValues = [StampField.Id, StampField.Value];

  private constructor(
    public readonly id: string,
    public readonly displayName: string,
    public readonly extractValue: (s: Stamp) => number | null,
  ) {}

  toString() {
    return this.id;
  }

  static fromString(id: string): StampField {
    switch (id) {
      case StampField.Id.id:
        return StampField.Id;
      case StampField.Value.id:
        return StampField.Value;
      default:
        throw new Error('Invalid id');
    }
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
  constructor(readonly field: StampField, readonly order: SortOrder) {}

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
    return (
      this.reverseMultiplier() * this.compareNullableNumber(this.field.extractValue(a), this.field.extractValue(b))
    );
  }

  private reverseMultiplier(): number {
    return this.order === SortOrder.Desc ? -1 : 1;
  }

  private compareNullableNumber(a: number | null, b: number | null): number {
    if (b !== null && a !== null) {
      return a > b ? 1 : a === b ? 0 : -1;
    } else if (b === null && a !== null) {
      return -1;
    } else if (b !== null && a === null) {
      return 1;
    } else {
      return 0;
    }
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
}
