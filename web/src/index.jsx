/**
 * Main entry point for budget web app
 */

import 'babel-polyfill';

import React from 'react';
import { render } from 'react-dom';
import { Provider } from 'react-redux';

import getStore from './store';

import App from './components/App';

// import styles and favicon
import './sass/index.scss';
import './images/favicon.png';

if (process.env.NODE_ENV !== 'test') {
    render(
        <Provider store={getStore()}>
            <App />
        </Provider>,
        document.getElementById('root')
    );
}

