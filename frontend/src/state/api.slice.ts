import { createSelector } from '@reduxjs/toolkit';
import { BaseQueryFn, createApi, FetchArgs, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { SearchOptions } from 'model';
import { createApiError, createUnknownError } from 'state/errors';
import _ from 'underscore';
import { decodeShops, Item, Shop, ShopsState } from './api/shops';
import { decodeStamps, RawStamps, Stamp } from './api/stamps';
import { RootState } from './store';
export type { ShopsState } from './api/shops';
export type { StampsState } from './api/stamps';

const baseQuery = fetchBaseQuery({ baseUrl: '/' });
const baseQueryWithErrorDecoding: BaseQueryFn<string | FetchArgs, unknown, unknown> = async (
  args,
  api,
  extraOptions,
) => {
  const result = await baseQuery(args, api, extraOptions);
  if (
    result.error &&
    typeof result.error.data === 'object' &&
    result.error.data !== null &&
    'message' in result.error.data
  ) {
    const message = (result.error.data as { message: string }).message;
    return { status: 'FETCH_ERROR', data: undefined, error: createApiError(message) };
  } else if (result.error) {
    console.log(result.error);
    return {
      status: 'FETCH_ERROR',
      data: undefined,
      error: createUnknownError(`HTTP ${result.meta?.response?.status}`),
    };
  } else {
    return result;
  }
};
const apiSlice = createApi({
  baseQuery: baseQueryWithErrorDecoding,
  tagTypes: ['shops'],
  endpoints: (builder) => ({
    getStamps: builder.query({
      query: () => '/data/stamps.json',
      transformResponse: (r: RawStamps) => decodeStamps('/data/', r),
    }),
    getShops: builder.query({
      query: () => '/data/shops.json',
      transformResponse: decodeShops,
      providesTags: ['shops'],
    }),
    updateShops: builder.mutation<undefined, File>({
      query: (file: File) => {
        const formData = new FormData();
        formData.append('file', file);
        return {
          url: 'https://sf.gwisp.dev/api/upload',
          method: 'POST',
          body: formData,
        };
      },
      transformResponse: () => undefined,
      invalidatesTags: ['shops'],
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

export const { useGetStampsQuery, useGetShopsQuery, useUpdateShopsMutation } = apiSlice;
export default apiSlice;
