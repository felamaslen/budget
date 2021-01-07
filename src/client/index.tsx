import { loadableReady } from '@loadable/component';
import React from 'react';
import { hydrate } from 'react-dom';
import { AppContainer } from 'react-hot-loader';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';

import * as serviceWorkerRegistration from './service-worker-registration';

import { ClientApp } from '~client/components/root';
import { store } from '~client/store';

if (process.env.NODE_ENV !== 'test') {
  loadableReady(() => {
    hydrate(
      <AppContainer>
        <Provider store={store}>
          <BrowserRouter>
            <ClientApp />
          </BrowserRouter>
        </Provider>
      </AppContainer>,
      document.getElementById('root'),
    );
  });
}

if (process.env.NODE_ENV === 'production') {
  serviceWorkerRegistration.register();
} else {
  serviceWorkerRegistration.unregister();
}
