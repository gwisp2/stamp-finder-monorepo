// import { Shop, ShopDb, ShopItem, Stamp, StampDb } from 'model';
// import React, { useCallback, useContext } from 'react';
// import { QueryClient, useMutation, useQuery, useQueryClient } from 'react-query';

// export interface StampsJson {
//   readonly [property: string]: StampsJsonEntry;
// }

// interface StampsJsonEntry {
//   readonly page: string;
//   readonly image: string | null;
//   readonly value: number | null;
//   readonly year: number | null;
//   readonly categories: Array<string> | null;
//   readonly series?: string;
//   readonly name?: string;
// }

// interface ItemJson {
//   readonly name: string;
//   readonly ids: number[];
//   readonly amount?: number | null;
// }

// export interface ShopJson {
//   readonly id: string;
//   readonly displayName: string;
//   readonly link: string;
//   readonly reportDate: string;
//   readonly items: ItemJson[];
// }

// export type ShopsJson = ShopJson[];

// export class ApiError extends Error {
//   constructor(msg: string) {
//     super(msg);
//     Object.setPrototypeOf(this, ApiError.prototype);
//   }
// }

// export class DataPath<T> {
//   constructor(
//     private readonly path: string,
//     private readonly queryPath: string[],
//     private readonly parser: (j: unknown, url: string) => T,
//   ) {}

//   async load(api: AppApi): Promise<T> {
//     console.log(`Loading ${this.path}`);
//     const url = api.dataUrl(this.path);
//     const json = await api.loadData<unknown>(url);
//     return this.parser(json, url);
//   }

//   parseAndSetData(api: AppApi, client: QueryClient, dataJson: unknown) {
//     const url = api.dataUrl(this.path);
//     return client.setQueryData(this.queryPath, this.parser(dataJson, url));
//   }

//   prefetch(client: QueryClient, api: AppApi): Promise<void> {
//     return client.prefetchQuery(this.queryPath, () => this.load(api), { cacheTime: Infinity, staleTime: Infinity });
//   }

//   useQuery() {
//     const api = useAppApi();
//     const queryOptions = { refetchOnWindowFocus: false, cacheTime: Infinity, staleTime: Infinity, retry: false };
//     const loadData = useCallback(() => this.load(api), [this.queryPath]);
//     return useQuery(this.queryPath, loadData, queryOptions);
//   }

//   static Stamps = new DataPath('/stamps.json', ['stamps'], (j: unknown, url: string) => {
//     const base = url.substring(0, url.lastIndexOf('/') + 1);
//     const stampsJson = j as StampsJson;
//     const stampArray = Array<Stamp>();
//     Object.keys(stampsJson).forEach((k) => {
//       const entry = stampsJson[k];
//       const image = entry.image ? base + entry.image : null;
//       const categories = entry.categories ?? Array<string>();
//       const series = entry.series ?? null;
//       const name = entry.name ?? null;
//       stampArray.push(
//         new Stamp(Number(k), new URL(entry.page), image, entry.value, entry.year, categories, series, name),
//       );
//     });
//     return new StampDb(stampArray);
//   });
//   static Shops = new DataPath('/shops.json', ['shops'], (j: unknown) => {
//     const shopsJson = j as ShopsJson;
//     const shops = new Array<Shop>();
//     shopsJson.forEach((shopJson, shopIndex) => {
//       const shop = new Shop(shopJson.id, shopJson.displayName, shopJson.link, shopJson.reportDate, shopIndex);
//       shops.push(shop);
//       for (const itemJson of shopJson.items) {
//         shop.addItem(new ShopItem(shop, itemJson.name, itemJson.ids, itemJson.amount ?? null));
//       }
//     });
//     return new ShopDb(shops);
//   });
// }

// export class AppApi {
//   constructor(private readonly data_base_url: string, private readonly call_base_url: string) {}

//   async loadData<T>(url: string): Promise<T> {
//     const response = await fetch(url, {
//       cache: 'no-cache',
//     });
//     if (response.status < 200 || response.status >= 400) {
//       // Error status
//       throw new Error(`Bad response status: ${response.status}`);
//     }
//     return (await response.json()) as T;
//   }

//   dataUrl(path: string): string {
//     return this.data_base_url + path;
//   }

//   async uploadShopXls(file: File): Promise<void> {
//     const data = new FormData();
//     data.append('file', file);
//     const response = await fetch(this.call_base_url + '/upload', {
//       method: 'POST',
//       body: data,
//     });
//     const response_json = (await response.json()) as { status: 'ok' } | { status: 'error'; message: string };
//     if (response_json.status === 'error') {
//       throw new ApiError(response_json.message);
//     }
//   }

//   static create() {
//     const dataUrl = process.env.REACT_APP_DATA_URL ?? 'data';
//     const callUrl = process.env.REACT_APP_CALL_URL ?? 'api';
//     return new AppApi(dataUrl, callUrl);
//   }
// }

// export const AppApiContext = React.createContext<AppApi | undefined>(undefined);

// export const useAppApi = (): AppApi => {
//   const api = useContext(AppApiContext);
//   if (api === undefined) {
//     throw new Error('No AppApi in context');
//   }
//   return api;
// };

// export const useShopUpload = () => {
//   const queryClient = useQueryClient();
//   const api = useAppApi();
//   return useMutation((file: File) => api.uploadShopXls(file), {
//     onSuccess: () => {
//       queryClient.invalidateQueries(['shops']);
//     },
//   });
// };
export default 1;
