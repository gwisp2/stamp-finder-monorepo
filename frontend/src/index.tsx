import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import './index.css';
import ReactGA from 'react-ga';
import { BrowserRouter, withRouter } from 'react-router-dom';

const ga_id = process.env.REACT_APP_GA_ID;
const ga_is_enabled = ga_id !== undefined && ga_id.length !== 0;
if (ga_id !== undefined && ga_is_enabled) {
  console.log(`GA ID is ${ga_id}`);
  ReactGA.initialize(ga_id);
  ReactGA.pageview(window.location.pathname + window.location.search);
}

const AppWithRouter = withRouter(({ history }) => {
  if (ga_is_enabled) {
    history.listen(() => {
      ReactGA.pageview(window.location.pathname + window.location.search);
    });
  }
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
