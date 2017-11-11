/**
 * Main entry point for budget web app
 */

/* eslint-disable global-require */

import 'babel-polyfill';

import React from 'react';
import { AppContainer } from 'react-hot-loader';
import { render } from 'react-dom';

import store from './store';
import Root from './containers/root';

// import styles and favicon
import './sass/index.scss';
import './images/favicon.png';

function renderApp(RootComponent = Root) {
    render(
        <AppContainer>
            <RootComponent store={store} />
        </AppContainer>,
        document.getElementById('root')
    );
}

if (process.env.NODE_ENV !== 'test') {
    renderApp();
}

if (module.hot) {
    module.hot.accept(
        './containers/root',
        () => renderApp(require('./containers/root').default)
    );
}

