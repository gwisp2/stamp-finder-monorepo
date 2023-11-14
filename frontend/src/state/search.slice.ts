import { SearchFormHandle, SearchOptions, SearchOptionsFormData } from '../model';
import { SfDatabase, Stamp } from '../api/SfDatabase.ts';
import { StateCreator } from 'zustand';
import { SfDatabaseSlice } from './database.slice.ts';
import { UseFieldArrayReturn } from 'react-hook-form';

export interface SearchPageSliceProps {
  database: SfDatabase;
  searchFormHandle: SearchFormHandle;
  searchFormShopFieldArray: UseFieldArrayReturn<SearchOptionsFormData, 'shops'>;
  searchOptions: SearchOptions;
}

export interface SearchPageSlice {
  searchFormHandle: SearchFormHandle;
  searchFormShopFieldArray: UseFieldArrayReturn<SearchOptionsFormData, 'shops'>;
  searchOptions: SearchOptions;
  foundStamps: Stamp[];

  setSearchOptions(options: SearchOptions): void;
}

export const createStampSearchSlice: (
  props: SearchPageSliceProps,
) => StateCreator<SfDatabaseSlice & SearchPageSlice, [], [], SearchPageSlice> = (props) => (set) => ({
  searchFormHandle: props.searchFormHandle,
  searchFormShopFieldArray: props.searchFormShopFieldArray,
  searchOptions: props.searchOptions,
  foundStamps: props.searchOptions.filterAndSort(props.database.stamps),
  setSearchOptions: (options: SearchOptions) =>
    set((state) => ({
      searchOptions: options,
      foundStamps: options.filterAndSort(state.database.stamps),
    })),
});
