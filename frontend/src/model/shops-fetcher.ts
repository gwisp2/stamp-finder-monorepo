import { Shop, ShopDb, ShopItem } from './shops';

export interface ItemJson {
  readonly name: string;
  readonly ids: number[];
  readonly amount?: number | null;
}

export interface ShopJson {
  readonly id: string;
  readonly displayName: string;
  readonly link: string;
  readonly reportDate: string;
  readonly items: ItemJson[];
}

export async function fetchShopsDb(url: URL): Promise<ShopDb> {
  const response = await fetch(url.toString());
  const shopsJson = (await response.json()) as ShopJson[];
  const shops = new Array<Shop>();
  shopsJson.forEach((shopJson, shopIndex) => {
    const shop = new Shop(shopJson.id, shopJson.displayName, shopJson.link, shopJson.reportDate, shopIndex);
    shops.push(shop);
    for (const itemJson of shopJson.items) {
      shop.addItem(new ShopItem(shop, itemJson.name, itemJson.ids, itemJson.amount ?? null));
    }
  });
  return new ShopDb(shops);
}
