import '@fontsource/roboto/300.css';
import '@fontsource/roboto/400.css';
import '@fontsource/roboto/500.css';
import '@fontsource/roboto/700.css';
import { Alert, AlertTitle, Box, CssBaseline } from '@mui/material';

import { createRoot } from 'react-dom/client';

import { SfDatabaseProvider } from 'api/SfDatabase';
import { StampApi, StampApiProvider } from 'api/StampApi';
import App from 'components/App';
import { GAWrapper } from 'components/GAWrapper';
import React from 'react';
import BeatLoader from 'react-spinners/BeatLoader';
import { useAsync } from 'react-use';
import { ApiError } from './api/fetch-helper';

async function loadEverything() {
  const stampApi = new StampApi();
  const database = await stampApi.loadDatabase();
  return { database, stampApi };
}

const AppLoader: React.FC = () => {
  // If you are wondering why everything is loaded twice in development
  // https://stackoverflow.com/questions/72238175/why-useeffect-running-twice-and-how-to-handle-it-well-in-react
  const asyncData = useAsync(loadEverything, []);
  if (asyncData.value) {
    const gaTag = process.env.SF_GA_TAG;
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

const start = async () => {
  const root = createRoot(document.getElementById('root')!);
  root.render(
    <React.StrictMode>
      <CssBaseline />
      <AppLoader />
    </React.StrictMode>,
  );
};

start().catch(console.log);
