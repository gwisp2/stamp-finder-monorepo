import { SfDatabase } from '../api/SfDatabase.ts';
import { ReactNode, useMemo } from 'react';
import { SearchOptions, useSearchOptionsForm } from '../model';
import { AppStoreContext, createAppStore } from '../state/app.store.ts';
import { useFavoritesStoreSyncBetweenTabs } from '../state/favorites.store.ts';

export const AppInitializer = (props: { database: SfDatabase; children: ReactNode }): ReactNode => {
  // Initialize search form state
  const initialSearchOptions = useMemo(
    () => SearchOptions.fromUrlParams(new URLSearchParams(document.location.search)),
    [],
  );
  const [formHandle, shopFieldArray] = useSearchOptionsForm(props.database, initialSearchOptions);

  // Synchronize favorites with other tabs
  useFavoritesStoreSyncBetweenTabs();

  const appStore = useMemo(
    () =>
      createAppStore({
        database: props.database,
        searchOptions: initialSearchOptions,
        searchFormHandle: formHandle,
        searchFormShopFieldArray: shopFieldArray,
      }),
    [],
  );
  return <AppStoreContext.Provider value={appStore}>{props.children}</AppStoreContext.Provider>;
};
