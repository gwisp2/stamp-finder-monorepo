import { GAWrapper } from 'components/GAWrapper';
import React from 'react';
import ReactDOM from 'react-dom';
import { QueryClient, QueryClientProvider } from 'react-query';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import './index.css';

const ga_id_env = process.env.REACT_APP_GA_ID;
const ga_id = ga_id_env && ga_id_env.length > 0 ? ga_id_env : undefined;

const queryClient = new QueryClient();
const root = document.getElementById('root');
ReactDOM.render(
  <React.StrictMode>
    <BrowserRouter>
      <QueryClientProvider client={queryClient}>
        <GAWrapper tag={ga_id}>
          <App />
        </GAWrapper>
      </QueryClientProvider>
    </BrowserRouter>
  </React.StrictMode>,
  root,
);
