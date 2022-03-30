import React from 'react';
import ReactDOM from 'react-dom';
import ReactGA from 'react-ga';
import { QueryClient, QueryClientProvider } from 'react-query';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import './index.css';

const ga_id = process.env.REACT_APP_GA_ID;
const ga_is_enabled = ga_id !== undefined && ga_id.length !== 0;
if (ga_id !== undefined && ga_is_enabled) {
  ReactGA.initialize(ga_id);
}

const queryClient = new QueryClient();
const root = document.getElementById('root');
ReactDOM.render(
  <React.StrictMode>
    <BrowserRouter>
      <QueryClientProvider client={queryClient}>
        <App />
      </QueryClientProvider>
    </BrowserRouter>
  </React.StrictMode>,
  root,
);
