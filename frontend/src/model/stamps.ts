import _ from 'underscore';
import { NumberRange } from './number-range';
import { Shop, ShopItem } from './shops';

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
    readonly presenceRequired: null | string[] | typeof ANY,
    readonly contains: string,
    readonly sort: StampSort,
  ) {}

  matches(s: Stamp): boolean {
    return (
      this.year.contains(s.year) &&
      this.value.contains(s.value) &&
      (!this.presenceRequired || s.isPresentInShop(this.presenceRequired)) &&
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

export class Stamp {
  readonly idNameAndSeries: string;
  shopItems: ShopItem[];

  constructor(
    readonly id: number,
    readonly page: URL,
    readonly imageUrl: string | null,
    readonly value: number | null,
    readonly year: number | null,
    readonly categories: Array<string>,
    readonly series: string | null,
    readonly name: string | null,
  ) {
    this.idNameAndSeries = (id + '|' + (name || '') + '|' + (series || '')).toLowerCase();
    this.shopItems = [];
  }

  isPresentInShop(shop: string[] | typeof ANY): boolean {
    if (shop === ANY) {
      return this.shopItems.length !== 0;
    }
    return _.any(this.shopItems, (item) => _.contains(shop, item.shop.id));
  }

  itemsGroupedByShops(): [Shop, ShopItem[]][] {
    const shopToItems = new Map<Shop, ShopItem[]>();
    for (const item of this.shopItems) {
      const shopItems = shopToItems.get(item.shop) ?? [];
      shopItems.push(item);
      shopToItems.set(item.shop, shopItems);
    }
    const shops = [...shopToItems.keys()];
    _.sortBy(shops, (s) => s.displayName);
    return shops.map((s) => [s, shopToItems.get(s)!]);
  }

  isSoldAnywhere(): boolean {
    return this.shopItems.length !== 0;
  }
}

export class StampDb {
  constructor(readonly stamps: Array<Stamp>) {}

  findStamps(searchOptions: SearchOptions): Array<Stamp> {
    const filteredStamps = this.stamps.filter((s) => searchOptions.matches(s));
    return searchOptions.sort.sort(filteredStamps);
  }
}
