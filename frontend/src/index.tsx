import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import './index.css';
import {BrowserRouter, withRouter} from "react-router-dom";

const AppWithRouter = withRouter(({history}) => (
    <App history={history}/>
))
ReactDOM.render(
    <React.StrictMode>
        <BrowserRouter>
            <AppWithRouter/>
        </BrowserRouter>
    </React.StrictMode>,
    document.getElementById('root')
);