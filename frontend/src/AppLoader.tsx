import App from 'components/App';
import React from 'react';
import { useGetShopsQuery, useGetStampsQuery } from 'state/api.slice';
import { AppSplashScreen } from './components/AppSplashScreen';

export const AppLoader: React.VFC = () => {
  const stampsQ = useGetStampsQuery(undefined);
  const shopsQ = useGetShopsQuery(undefined);
  if (stampsQ.data !== undefined && shopsQ.data !== undefined) {
    return <App />;
  } else if (stampsQ.isError || shopsQ.isError) {
    const failedLoadDataType = stampsQ.isError ? 'данные о марках' : 'данные о наличии марок';
    return <AppSplashScreen error={`Не удалось загрузить ${failedLoadDataType}`} />;
  } else {
    return <AppSplashScreen />;
  }
};
