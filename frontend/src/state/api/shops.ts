export interface RawItem {
  name: string;
  ids: number[];
  amount?: number | null;
}

export interface RawShop {
  id: string;
  displayName: string;
  link: string;
  reportDate: string;
  items: RawItem[];
}

export type RawShops = RawShop[];

export interface Item {
  shopId: string;
  name: string;
  amount: number | null;
  stampIds: Array<number>;
}

export interface Shop {
  id: string;
  displayName: string;
  link: string;
  items: Array<Item>;
  reportDate: string | null;
  index: number;
}

export interface ShopsState {
  shops: Shop[];
  id2shop: Record<string, Shop>;
  itemId2items: Record<number, Item[]>;
}

export const decodeShops = (response: RawShops): ShopsState => {
  const res: ShopsState = {
    shops: [],
    id2shop: {},
    itemId2items: {},
  };

  // Populate shops & id2shop
  for (const shopEntry of response) {
    const shop: Shop = {
      index: res.shops.length,
      id: shopEntry.id,
      link: shopEntry.link,
      displayName: shopEntry.displayName,
      reportDate: shopEntry.reportDate,
      items: [],
    };
    shop.items = shopEntry.items.map(
      (item): Item => ({
        shopId: shop.id,
        name: item.name,
        stampIds: item.ids,
        amount: item.amount ?? null,
      }),
    );
    res.shops.push(shop);
    res.id2shop[shop.id] = shop;
  }

  // Populate itemId2items
  for (const shops of res.shops) {
    for (const item of shops.items) {
      for (const stampId of item.stampIds) {
        res.itemId2items[stampId] = res.itemId2items[stampId] || [];
        res.itemId2items[stampId].push(item);
      }
    }
  }

  return res;
};
