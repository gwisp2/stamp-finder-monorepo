import { createSelector } from '@reduxjs/toolkit';
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { SearchOptions } from 'model';
import _ from 'underscore';
import { decodeShops, Item, Shop, ShopsState } from './api/shops';
import { decodeStamps, RawStamps, Stamp } from './api/stamps';
import { RootState } from './store';
export type { ShopsState } from './api/shops';
export type { StampsState } from './api/stamps';

const apiSlice = createApi({
  baseQuery: fetchBaseQuery({ baseUrl: '/data' }),
  endpoints: (builder) => ({
    getStamps: builder.query({
      query: () => '/stamps.json',
      transformResponse: (r: RawStamps) => decodeStamps('/data/', r),
    }),
    getShops: builder.query({
      query: () => '/shops.json',
      transformResponse: decodeShops,
    }),
  }),
});

export const selectStampsState = (s: RootState) => apiSlice.endpoints.getStamps.select(undefined)(s).data;
export const selectShopsState = (s: RootState) => apiSlice.endpoints.getShops.select(undefined)(s).data!;
export const selectAllStamps = (s: RootState) => Object.values(selectStampsState(s)!) as Stamp[];
export const selectAllShops = (s: RootState) => selectShopsState(s)!.shops;
export const selectItemsForStamp = (stamp: Stamp) => (s: RootState) =>
  selectShopsState(s)?.itemId2items[stamp.id] ?? [];
export const selectGroupedItemsForStamp = (stamp: Stamp) => (s: RootState) => {
  const shopsState = selectShopsState(s);
  const items = selectItemsForStamp(stamp)(s);
  const itemGroups = _.groupBy(items, (i) => i.shopId);
  const res: [Shop, Item[]][] = [];
  for (const [shopId, items] of Object.entries(itemGroups)) {
    res.push([shopsState.id2shop[shopId]!, items]);
  }
  return res;
};

export const selectStamps = createSelector(
  [selectAllStamps, selectShopsState, (_, searchOptions: SearchOptions) => searchOptions],
  (stamps: Stamp[], shops: ShopsState, searchOptions) => {
    const findItems = (stamp: Stamp) => shops.itemId2items[stamp.id] ?? [];
    return searchOptions.sort.sort(stamps.filter((s) => searchOptions.matches(s, findItems(s))));
  },
);

export const { useGetStampsQuery, useGetShopsQuery } = apiSlice;
export default apiSlice;
