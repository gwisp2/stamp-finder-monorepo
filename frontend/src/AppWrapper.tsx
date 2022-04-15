import { GAWrapper } from 'components/GAWrapper';
import React from 'react';
import { AppApi, AppApiContext } from 'service/AppApi';
import App from './App';
import './index.css';

export const AppWrapper: React.VFC<{ api: AppApi }> = (props) => {
  const ga_id_env = process.env.REACT_APP_GA_ID;
  const ga_id = ga_id_env && ga_id_env.length > 0 ? ga_id_env : undefined;

  return (
    <AppApiContext.Provider value={props.api}>
      <GAWrapper tag={ga_id}>
        <App />
      </GAWrapper>
    </AppApiContext.Provider>
  );
};
