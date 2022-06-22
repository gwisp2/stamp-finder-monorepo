import { Item } from 'state/api/shops';
import { Stamp } from 'state/api/stamps';
import _ from 'underscore';
import { NumberRange } from './number-range';

export enum StampField {
  Id,
  Value,
}

export enum SortOrder {
  Natural,
  Reversed,
}

export class StampSort {
  constructor(readonly field: StampField, readonly order: SortOrder) {}

  name(): string {
    const fieldName = this.field === StampField.Id ? 'По номеру' : 'По номиналу';
    const dirName = this.order === SortOrder.Natural ? 'вверх' : 'вниз';
    return `${fieldName} (${dirName})`;
  }

  sort(arr: Stamp[]): Stamp[] {
    return arr.sort(this.compare.bind(this));
  }

  compare(a: Stamp, b: Stamp): number {
    return this.reverseMultiplier() * this.compareNullableNumber(this.extractField(a), this.extractField(b));
  }

  private reverseMultiplier(): number {
    return this.order === SortOrder.Reversed ? -1 : 1;
  }

  private extractField(stamp: Stamp): number | null {
    switch (this.field) {
      case StampField.Id:
        return stamp.id;
      case StampField.Value:
        return stamp.value;
    }
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
    new StampSort(StampField.Id, SortOrder.Reversed),
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

  matches(s: Stamp, shopItems: Item[]): boolean {
    return (
      this.year.contains(s.year) &&
      this.value.contains(s.value) &&
      (!this.presenceRequired ||
        (Array.isArray(this.presenceRequired) &&
          _.any(shopItems, (item) => _.contains(this.presenceRequired || [], item.shopId))) ||
        (this.presenceRequired === ANY && shopItems.length !== 0)) &&
      (this.category === null || s.categories.includes(this.category)) &&
      s.idNameAndSeries.indexOf(this.contains.toLowerCase()) >= 0
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
    let sort = SearchOptions.Default.sort;
    if (sortStr !== null) {
      const sortParts = sortStr.split('-');
      const field = Number(sortParts[0]);
      const order = Number(sortParts[1]);
      sort = new StampSort(field, order);
    }
    return new SearchOptions(value, year, category, present, containsStr || '', sort);
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
