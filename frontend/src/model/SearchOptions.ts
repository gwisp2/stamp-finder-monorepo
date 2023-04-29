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

  private constructor(public readonly id: string) {}

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

  applyChange(partial: Partial<StampSort>) {
    return new StampSort(partial.field ?? this.field, partial.order ?? this.order);
  }

  toString(): string {
    return `${this.field} ${this.order}`;
  }

  static fromString(str: string): StampSort {
    const sortParts = str.split('-');
    const field = sortParts[0];
    const order = sortParts[1];
    return new StampSort(StampField.fromString(field), SortOrder.fromString(order));
  }

  sort(arr: Stamp[]): Stamp[] {
    return arr.sort(this.compare.bind(this));
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
export type ShopRequirement = null | string[] | typeof ANY;

export class SearchOptions {
  static Default = new SearchOptions(
    new NumberRange(null, null),
    new NumberRange(1998, null),
    null,
    null,
    '',
    new StampSort(StampField.Id, SortOrder.Desc),
  );

  constructor(
    readonly value: NumberRange,
    readonly year: NumberRange,
    readonly category: string | null,
    readonly presenceRequired: ShopRequirement,
    readonly contains: string,
    readonly sort: StampSort,
  ) {}

  applyChange(change: Partial<SearchOptions>): SearchOptions {
    const coalesce = <T>(newV: T | undefined, oldV: T): T => (newV !== undefined ? newV : oldV);
    return new SearchOptions(
      coalesce(change.value, this.value),
      coalesce(change.year, this.year),
      coalesce(change.category, this.category),
      coalesce(change.presenceRequired, this.presenceRequired),
      coalesce(change.contains, this.contains),
      coalesce(change.sort, this.sort),
    );
  }

  filterAndSort(stamps: Stamp[]): Stamp[] {
    return stamps.filter((s) => this.matches(s)).sort((a, b) => this.sort.compare(a, b));
  }

  matches(s: Stamp): boolean {
    return (
      this.year.contains(s.year) &&
      this.value.contains(s.value) &&
      this.presenceMatches(s.shopItems) &&
      (this.category === null || s.categories.includes(this.category)) &&
      (this.contains.length === 0 || s.idNameAndSeries.indexOf(this.contains.toLowerCase()) >= 0)
    );
  }

  private presenceMatches(shopItems: Item[]): boolean {
    return (
      !this.presenceRequired ||
      (Array.isArray(this.presenceRequired) &&
        _.some(shopItems, (item) => _.includes(this.presenceRequired || [], item.shop.id))) ||
      (this.presenceRequired === ANY && shopItems.length !== 0)
    );
  }

  static fromUrlParams(params: URLSearchParams): SearchOptions {
    const valueStr = params.get('value');
    const yearStr = params.get('year');
    const categoryStr = params.get('category');
    const containsStr = params.get('contains');
    const presentStr = params.get('present');
    const sortStr = params.get('sort');
    const value = valueStr !== null ? SearchOptions.fromUrlParam(valueStr) : SearchOptions.Default.value;
    const year = yearStr !== null ? SearchOptions.fromUrlParam(yearStr) : SearchOptions.Default.year;
    const category =
      categoryStr !== null ? (categoryStr !== '<null>' ? categoryStr : null) : SearchOptions.Default.category;
    const present =
      presentStr !== null ? SearchOptions.stringListfromUrlParam(presentStr) : SearchOptions.Default.presenceRequired;
    const sort = sortStr !== null ? StampSort.fromString(sortStr) : SearchOptions.Default.sort;
    return new SearchOptions(value, year, category, present, containsStr || '', sort);
  }

  static fromUrlSearchString(str: string): SearchOptions {
    return SearchOptions.fromUrlParams(new URLSearchParams(str));
  }

  private static stringListfromUrlParam(p: string): string[] | typeof ANY {
    if (p == ANY) {
      return ANY;
    }
    return p.split(',');
  }

  private static fromUrlParam(p: string): NumberRange {
    const parts = p.split('~');
    if (parts.length === 1) {
      return NumberRange.exact(parts[0] !== '' ? Number(parts[0]) : null);
    } else {
      const start = parts[0] !== '' ? Number(parts[0]) : null;
      const end = parts[1] !== '' ? Number(parts[1]) : null;
      return NumberRange.between(start, end);
    }
  }

  toUrlParams(): URLSearchParams {
    const params = new URLSearchParams();
    if (!_.isEqual(SearchOptions.Default.value, this.value)) {
      params.set('value', SearchOptions.toUrlParam(this.value));
    }
    if (!_.isEqual(SearchOptions.Default.year, this.year)) {
      params.set('year', SearchOptions.toUrlParam(this.year));
    }
    if (this.category !== SearchOptions.Default.category) {
      params.set('category', this.category ?? '<null>');
    }
    if (this.presenceRequired !== null && this.presenceRequired.length !== 0) {
      const v = this.presenceRequired === ANY ? ANY : this.presenceRequired.join(',');
      params.set('present', v);
    }
    if (!_.isEqual(this.sort, SearchOptions.Default.sort)) {
      params.set('sort', this.sort.field + '-' + this.sort.order);
    }
    if (!_.isEqual(this.contains, SearchOptions.Default.contains)) {
      params.set('contains', this.contains);
    }
    return params;
  }

  toUrlSearchString(): string {
    return this.toUrlParams().toString();
  }

  private static toUrlParam(range: NumberRange): string {
    if (range.exact) {
      return range.start !== null ? '' + range.start : '';
    } else {
      const startStr = range.start !== null ? '' + range.start : '';
      const endStr = range.end !== null ? '' + range.end : '';
      return startStr + '~' + endStr;
    }
  }
}
