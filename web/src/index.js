/**
 * Main entry point for budget web app
 */

import React from 'react';
import { AppContainer } from 'react-hot-loader';
import { render } from 'react-dom';
import { BrowserRouter } from 'react-router-dom';

import store from './store';
import Root from '~client/containers/Root';

import './images/favicon.png';

function renderApp(RootComponent = Root) {
    render(
        <AppContainer>
            <BrowserRouter>
                <RootComponent store={store} />
            </BrowserRouter>
        </AppContainer>,
        document.getElementById('root'),
    );
}

if (process.env.NODE_ENV !== 'test') {
    renderApp();
}

if (module.hot) {
    module.hot.accept(
        './containers/Root',
        // eslint-disable-next-line global-require
        () => renderApp(require('./containers/Root').default),
    );
}
