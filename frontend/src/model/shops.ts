import Multimap from 'multimap';
import _ from 'underscore';
import { StampDb } from './stamps';

export class ShopItem {
  constructor(
    readonly shop: Shop,
    readonly name: string,
    readonly ids: Array<number>,
    readonly amount: number | null,
  ) {}
}

export class Shop {
  items: Array<ShopItem>;

  constructor(
    readonly id: string,
    readonly displayName: string,
    readonly link: string,
    readonly reportDate: string | null,
    readonly sortIndex: number,
  ) {
    this.items = new Array<ShopItem>();
  }

  addItem(item: ShopItem): void {
    this.items.push(item);
  }
}

export class ShopDb {
  private id2items: Multimap<number, ShopItem>;
  public shops: Shop[];

  constructor(unsortedShops: Shop[]) {
    this.shops = [...unsortedShops];
    _.sortBy(this.shops, (s) => s.sortIndex);
    this.id2items = new Multimap<number, ShopItem>();
    for (const shop of this.shops) {
      for (const item of shop.items) {
        for (const id of item.ids) {
          if (!_.contains(this.id2items.get(id) ?? [], id)) {
            this.id2items.set(id, item, ...(this.id2items.get(id) ?? []));
          }
        }
      }
    }
  }

  findItemsById(id: number): ShopItem[] {
    const items = this.id2items.get(id) ?? [];
    return _.sortBy(
      _.sortBy(items, (i) => i.name),
      (i) => i.shop.sortIndex,
    );
  }

  wireToStampDb(stampDb: StampDb): void {
    for (const stamp of stampDb.stamps) {
      stamp.shopItems = this.findItemsById(stamp.id);
    }
  }
}
