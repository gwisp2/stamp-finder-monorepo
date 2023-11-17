import { SfDatabase } from '../api/SfDatabase.ts';
import { ReactNode, useMemo } from 'react';
import { SearchOptions, useSearchOptionsForm, zSearchOptions } from '../model';
import { AppStoreContext, createAppStore } from '../state/app.store.ts';
import { useFavoritesStoreSyncBetweenTabs } from '../state/favorites.store.ts';
import { useStore } from 'zustand';
import { ComboOptions, useComboOptionsForm, zComboOptions } from '../model/ComboOptions.ts';

export const AppInitializer = (props: { database: SfDatabase; children: ReactNode }): ReactNode => {
  // Initialize search form state
  const initialSearchOptions = useMemo(
    () => SearchOptions.fromUrlParams(new URLSearchParams(document.location.search)),
    [],
  );
  const searchFormHandle = useSearchOptionsForm(props.database, initialSearchOptions);
  const comboFormHandle = useComboOptionsForm(props.database, ComboOptions.Default);

  // Synchronize favorites with other tabs
  useFavoritesStoreSyncBetweenTabs();

  // Create the global store
  const appStore = useMemo(
    () =>
      createAppStore({
        database: props.database,
        searchFormHandle,
        comboFormHandle,
      }),
    [],
  );

  // Sync search form data and searchOptions
  const setSearchOptions = useStore(appStore, (s) => s.setSearchOptions);
  searchFormHandle.context.watch((value) => {
    const parsedOptions = zSearchOptions.safeParse(value);
    if (parsedOptions.success) {
      setSearchOptions(parsedOptions.data);
    }
  });

  // Sync combo form data and comboOptions
  const setComboOptions = useStore(appStore, (s) => s.setComboOptions);
  comboFormHandle.context.watch((value) => {
    const parsedOptions = zComboOptions.safeParse(value);
    if (parsedOptions.success) {
      setComboOptions(parsedOptions.data);
    }
  });

  return <AppStoreContext.Provider value={appStore}>{props.children}</AppStoreContext.Provider>;
};
