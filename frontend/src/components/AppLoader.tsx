import React, { useEffect } from 'react';
import { useAsync } from 'react-use';
import { startSyncFavoritesBetweenTabs } from '../api/FavoritesManager.ts';
import { StampApi, StampApiProvider } from '../api/StampApi.ts';
import { SfDatabaseProvider } from '../api/SfDatabase.ts';
import { GAWrapper } from './GAWrapper.tsx';
import App from './App.tsx';
import { Alert, AlertTitle, Box } from '@mui/material';
import BeatLoader from 'react-spinners/BeatLoader';
import { ApiError } from '../api/fetch-helper.ts';

async function loadEverything() {
  const stampApi = new StampApi();
  const database = await stampApi.loadDatabase();
  return { database, stampApi };
}

export const AppLoader: React.FC = () => {
  // If you are wondering why everything is loaded twice in development
  // https://stackoverflow.com/questions/72238175/why-useeffect-running-twice-and-how-to-handle-it-well-in-react
  const asyncData = useAsync(loadEverything, []);
  // Sync favorites between tabs
  useEffect(() => startSyncFavoritesBetweenTabs(), []);
  if (asyncData.value) {
    const gaTag = import.meta.env.VITE_SF_GA_TAG;
    return (
      <StampApiProvider value={asyncData.value.stampApi}>
        <SfDatabaseProvider value={asyncData.value.database}>
          <GAWrapper tag={gaTag}>
            <App />
          </GAWrapper>
        </SfDatabaseProvider>
      </StampApiProvider>
    );
  }
  return (
    <Box display="flex" justifyContent="center" alignItems="center" height="100vh">
      {!asyncData.error && <BeatLoader />}
      {asyncData.error && (
        <Alert severity="error">
          <AlertTitle>Не удалось загрузить данные</AlertTitle>
          <pre>{(asyncData.error as ApiError).message}</pre>
        </Alert>
      )}
    </Box>
  );
};
