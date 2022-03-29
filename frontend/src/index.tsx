import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import './index.css';
import ReactGA from 'react-ga';
import { BrowserRouter, withRouter } from 'react-router-dom';
import { useEffect } from 'react';

const ga_id = process.env.REACT_APP_GA_ID;
const ga_is_enabled = ga_id !== undefined && ga_id.length !== 0;
if (ga_id !== undefined && ga_is_enabled) {
  ReactGA.initialize(ga_id);
}

const AppWithRouter = withRouter(({ history }) => {
  useEffect(() => {
    if (ga_is_enabled) {
      ReactGA.pageview(history.location.pathname + history.location.search);
    }
  }, [history.location]);
  return <App history={history} />;
});
ReactDOM.render(
  <React.StrictMode>
    <BrowserRouter>
      <AppWithRouter />
    </BrowserRouter>
  </React.StrictMode>,
  document.getElementById('root'),
);
