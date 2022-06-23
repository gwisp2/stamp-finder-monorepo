import { AppRoot } from 'AppRoot';
import 'bootstrap/dist/css/bootstrap.min.css';
import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';

const start = async () => {
  // Render
  const root = document.getElementById('root')!;
  ReactDOM.render(<AppRoot />, root);
};

start();
