import '@babel/polyfill';

import React from 'react';
import { render } from 'react-dom';
import { AppContainer } from 'react-hot-loader';
import { BrowserRouter } from 'react-router-dom';

import Root from '~client/containers/Root';
import { store } from '~client/store';

import './images/favicon.png';

function renderApp(RootComponent = Root): void {
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
