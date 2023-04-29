import { AppLoader } from 'AppLoader';
import React from 'react';
import { BrowserRouter } from 'react-router-dom';

export const AppRoot: React.FC<{ isServer?: boolean; location?: string }> = () => {
  return (
    <React.StrictMode>
      <BrowserRouter>
        <AppLoader />
      </BrowserRouter>
    </React.StrictMode>
  );
};
