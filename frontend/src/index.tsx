import { GAWrapper } from 'components/GAWrapper';
import React from 'react';
import ReactDOM from 'react-dom';
import { QueryClient, QueryClientProvider } from 'react-query';
import { BrowserRouter } from 'react-router-dom';
import { AppApi, AppApiContext } from 'service/AppApi';
import App from './App';
import './index.css';

const ga_id_env = process.env.REACT_APP_GA_ID;
const ga_id = ga_id_env && ga_id_env.length > 0 ? ga_id_env : undefined;

const dataUrl = process.env.REACT_APP_DATA_URL ?? 'data';
const callUrl = process.env.REACT_APP_CALL_URL ?? 'http://localhost:5000/api';
const appApi = new AppApi(dataUrl, callUrl);

const queryClient = new QueryClient();
const root = document.getElementById('root');
ReactDOM.render(
  <React.StrictMode>
    <BrowserRouter>
      <AppApiContext.Provider value={appApi}>
        <QueryClientProvider client={queryClient}>
          <GAWrapper tag={ga_id}>
            <App />
          </GAWrapper>
        </QueryClientProvider>
      </AppApiContext.Provider>
    </BrowserRouter>
  </React.StrictMode>,
  root,
);
