import { ConfigLoader } from 'api/ConfigLoader';
import { ApiError } from 'api/fetch-helper';
import { SfDatabaseProvider } from 'api/SfDatabase';
import { StampApi, StampApiProvider } from 'api/StampApi';
import App from 'components/App';
import { GAWrapper } from 'components/GAWrapper';
import React from 'react';
import { useAsync } from 'react-use';
import { AppSplashScreen } from './components/AppSplashScreen';

async function loadEverything() {
  const config = await new ConfigLoader().loadConfig();
  const stampApi = new StampApi(config);
  const database = await stampApi.loadDatabase();
  return { config, database, stampApi };
}

export const AppLoader: React.FC = () => {
  const asyncData = useAsync(loadEverything, []);
  if (asyncData.value) {
    const gaTag = asyncData.value.config.analytics?.google;
    return (
      <StampApiProvider value={asyncData.value.stampApi}>
        <SfDatabaseProvider value={asyncData.value.database}>
          <GAWrapper tag={gaTag}>
            <App />
          </GAWrapper>
        </SfDatabaseProvider>
      </StampApiProvider>
    );
  } else if (asyncData.error) {
    return (
      <AppSplashScreen
        error={{
          title: `Не удалось загрузить данные`,
          description: (asyncData.error as ApiError).message,
        }}
      />
    );
  } else {
    return <AppSplashScreen />;
  }
};
