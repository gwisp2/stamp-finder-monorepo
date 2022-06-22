import { AppLoader } from 'AppLoader';
import 'bootstrap/dist/css/bootstrap.min.css';
import { GAWrapper } from 'components/GAWrapper';
import React from 'react';
import ReactDOM from 'react-dom';
import { Provider as ReduxProvider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import { createStore } from 'state/store';
import './index.css';

const start = async () => {
  // Analytics
  const gaIdEnv = process.env.REACT_APP_GA_ID;
  const analyticsTag = gaIdEnv && gaIdEnv.length > 0 ? gaIdEnv : undefined;

  // Setup Redux store
  const store = createStore();

  // Prepare element for rendering
  const app = (
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

  // Render
  const root = document.getElementById('root')!;
  ReactDOM.render(app, root);
};

start();
