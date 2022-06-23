import { AppLoader } from 'AppLoader';
import { GAWrapper } from 'components/GAWrapper';
import React, { useMemo } from 'react';
import { Provider as ReduxProvider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import { StaticRouter } from 'react-router-dom/server';
import { createStore } from 'state/store';

export const AppRoot: React.VFC<{ isServer?: boolean; location?: string }> = (props) => {
  const store = useMemo(() => createStore(), []);
  if (props.isServer) {
    return (
      <React.StrictMode>
        <ReduxProvider store={store}>
          <StaticRouter location={props.location ?? '/'}>
            <GAWrapper>
              <AppLoader />
            </GAWrapper>
          </StaticRouter>
        </ReduxProvider>
      </React.StrictMode>
    );
  } else {
    const gaIdEnv = process.env.REACT_APP_GA_ID;
    const analyticsTag = gaIdEnv && gaIdEnv.length > 0 ? gaIdEnv : undefined;
    return (
      <React.StrictMode>
        <ReduxProvider store={store}>
          <BrowserRouter>
            <GAWrapper tag={analyticsTag}>
              <AppLoader />
            </GAWrapper>
          </BrowserRouter>
        </ReduxProvider>
      </React.StrictMode>
    );
  }
};
