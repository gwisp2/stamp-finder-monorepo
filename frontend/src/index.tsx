import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import './index.css';
import {BrowserRouter, withRouter} from "react-router-dom";

const AppWithRouter = withRouter(({history}) => {
    history.listen((location) => {
        if (typeof window.ga === 'function') {
            window.ga('set', 'page', location.pathname + location.search);
            window.ga('send', 'pageview');
        }
    });
    return <App history={history}/>
})
ReactDOM.render(
    <React.StrictMode>
        <BrowserRouter>
            <AppWithRouter/>
        </BrowserRouter>
    </React.StrictMode>,
    document.getElementById('root')
);