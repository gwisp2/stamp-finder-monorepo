import App from 'components/App';
import React from 'react';
import { useGetShopsQuery, useGetStampsQuery } from 'state/api.slice';
import { formatError } from 'state/errors';
import { AppSplashScreen } from './components/AppSplashScreen';

export const AppLoader: React.VFC = () => {
  const stampsQ = useGetStampsQuery(undefined);
  const shopsQ = useGetShopsQuery(undefined);
  if (stampsQ.data !== undefined && shopsQ.data !== undefined) {
    return <App />;
  } else if (stampsQ.isError || shopsQ.isError) {
    const failedLoadDataType = stampsQ.isError ? 'данные о марках' : 'данные о наличии марок';
    const error = stampsQ.error || shopsQ.error;
    return (
      <AppSplashScreen
        error={{
          title: `Не удалось загрузить ${failedLoadDataType}`,
          description: formatError(error),
        }}
      />
    );
  } else {
    return <AppSplashScreen />;
  }
};
