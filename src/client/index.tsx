import { loadableReady } from '@loadable/component';
import React from 'react';
import { hydrate, render } from 'react-dom';
import { AppContainer } from 'react-hot-loader';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';

import * as serviceWorkerRegistration from './service-worker-registration';

import { ClientApp } from '~client/components/root';
import { store } from '~client/store';

if (process.env.NODE_ENV !== 'test') {
  const app = (
    <AppContainer>
      <Provider store={store}>
        <BrowserRouter>
          <ClientApp />
        </BrowserRouter>
      </Provider>
    </AppContainer>
  );

  loadableReady(() => {
    const root = document.getElementById('root');

    if (root?.childNodes.length === 0) {
      render(app, root);
    } else {
      hydrate(app, root);
    }
  });
}

if (process.env.NODE_ENV === 'production') {
  serviceWorkerRegistration.register();
} else {
  serviceWorkerRegistration.unregister();
}
