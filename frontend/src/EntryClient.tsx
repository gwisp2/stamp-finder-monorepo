import { AppWrapper } from 'AppWrapper';
import React from 'react';
import ReactDOM from 'react-dom';
import { QueryClient, QueryClientProvider } from 'react-query';
import { BrowserRouter } from 'react-router-dom';
import { AppApi, DataPath } from 'service/AppApi';

const startClient = async () => {
  // Setup api client & query cache manager
  const queryClient = new QueryClient();
  const appApi = AppApi.create();

  // Load data before rendering
  const q1 = DataPath.Shops.prefetch(queryClient, appApi);
  const q2 = DataPath.Stamps.prefetch(queryClient, appApi);
  await Promise.all([q1, q2]);

  // Prepare element for rendering
  const app = (
    <React.StrictMode>
      <BrowserRouter>
        <QueryClientProvider client={queryClient}>
          <AppWrapper api={appApi} />
        </QueryClientProvider>
      </BrowserRouter>
    </React.StrictMode>
  );

  // Render
  const root = document.getElementById('root')!;
  if (root.children.length) {
    // Something is in #root: should be server-rendered data
    ReactDOM.hydrate(app, root);
  } else {
    ReactDOM.render(app, root);
  }
};

startClient();
