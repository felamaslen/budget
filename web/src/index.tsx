import '@babel/polyfill';

import React from 'react';
import { render } from 'react-dom';
import { AppContainer } from 'react-hot-loader';
import { BrowserRouter } from 'react-router-dom';

import { GQLProvider } from '~client/components/gql-provider';
import { Root } from '~client/components/root';
import { store } from '~client/store';

function renderApp(RootComponent = Root): void {
  render(
    <AppContainer>
      <BrowserRouter>
        <GQLProvider>
          <RootComponent store={store} />
        </GQLProvider>
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
    './components/root',
    // eslint-disable-next-line global-require
    () => renderApp(require('./components/root').Root),
  );
}
