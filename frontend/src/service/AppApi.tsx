import { Shop, ShopDb, ShopItem, Stamp, StampDb } from 'model';
import React, { useCallback, useContext } from 'react';
import { useMutation, useQuery, useQueryClient } from 'react-query';

interface StampsJson {
  readonly [property: string]: StampsJsonEntry;
}

interface StampsJsonEntry {
  readonly page: string;
  readonly image: string | null;
  readonly value: number | null;
  readonly year: number | null;
  readonly categories: Array<string> | null;
  readonly series?: string;
  readonly name?: string;
}

interface ItemJson {
  readonly name: string;
  readonly ids: number[];
  readonly amount?: number | null;
}

interface ShopJson {
  readonly id: string;
  readonly displayName: string;
  readonly link: string;
  readonly reportDate: string;
  readonly items: ItemJson[];
}

export class ApiError extends Error {
  constructor(msg: string) {
    super(msg);
    Object.setPrototypeOf(this, ApiError.prototype);
  }
}

export class AppApi {
  constructor(private readonly data_base_url: string, private readonly call_base_url: string) {}

  async fetchShopsDb(): Promise<ShopDb> {
    const response = await fetch(new URL(this.data_base_url + '/shops.json', document.baseURI).toString(), {
      cache: 'no-cache',
    });
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

  async uploadShopXls(file: File): Promise<void> {
    const data = new FormData();
    data.append('file', file);
    const response = await fetch(new URL(this.call_base_url + '/upload', document.baseURI).toString(), {
      method: 'POST',
      body: data,
    });
    const response_json = (await response.json()) as { status: 'ok' } | { status: 'error'; message: string };
    if (response_json.status === 'error') {
      throw new ApiError(response_json.message);
    }
  }

  async fetchStampsDb(): Promise<StampDb> {
    const url = new URL(this.data_base_url + '/stamps.json', document.baseURI);
    const response = await fetch(url.toString(), { cache: 'no-cache' });
    const stampsJson = (await response.json()) as StampsJson;
    const stampArray = Array<Stamp>();
    Object.keys(stampsJson).forEach((k) => {
      const entry = stampsJson[k];
      const image = entry.image ? new URL(entry.image, url) : null;
      const categories = entry.categories ?? Array<string>();
      const series = entry.series ?? null;
      const name = entry.name ?? null;
      stampArray.push(
        new Stamp(Number(k), new URL(entry.page), image, entry.value, entry.year, categories, series, name),
      );
    });
    return new StampDb(stampArray);
  }
}

export const AppApiContext = React.createContext<AppApi | undefined>(undefined);

export const useAppApi = (): AppApi => {
  const api = useContext(AppApiContext);
  if (api === undefined) {
    throw new Error('No AppApi in context');
  }
  return api;
};

export const useApiQuery = <T,>(id: string[], fn: (api: AppApi) => Promise<T>) => {
  const api = useAppApi();
  const queryOptions = { refetchOnWindowFocus: false, cacheTime: Infinity, staleTime: Infinity };
  const loadData = useCallback(() => fn(api), [id]);
  return useQuery(id, loadData, queryOptions);
};

export const useShopsDb = () => {
  return useApiQuery(['shops'], (api) => api.fetchShopsDb());
};

export const useStampsDb = () => {
  return useApiQuery(['stamps'], (api) => api.fetchStampsDb());
};

export const useShopUpload = () => {
  const queryClient = useQueryClient();
  const api = useAppApi();
  return useMutation((file: File) => api.uploadShopXls(file), {
    onSuccess: () => {
      queryClient.invalidateQueries(['shops']);
    },
  });
};
