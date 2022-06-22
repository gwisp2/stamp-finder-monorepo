import React from 'react';
import BeatLoader from 'react-spinners/BeatLoader';

export const AppSplashScreen: React.VFC<{ error?: string }> = React.memo((props) => {
  return (
    <div className="d-flex align-items-center justify-content-center vh-100">
      {!props.error && <BeatLoader />}
      {props.error && (
        <div className="alert alert-danger" role="alert">
          {props.error}
        </div>
      )}
    </div>
  );
});
AppSplashScreen.displayName = 'AppSplashScreen';
