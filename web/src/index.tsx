import React from 'react';
import { render } from 'react-dom';
import { AppContainer } from 'react-hot-loader';
import { BrowserRouter } from 'react-router-dom';

import * as serviceWorkerRegistration from './service-worker-registration';

import { Root } from '~client/components/root';
import { store } from '~client/store';

if (process.env.NODE_ENV !== 'test') {
  render(
    <AppContainer>
      <BrowserRouter>
        <Root store={store} />
      </BrowserRouter>
    </AppContainer>,
    document.getElementById('root'),
  );
}

if (process.env.NODE_ENV === 'production') {
  serviceWorkerRegistration.register();
} else {
  serviceWorkerRegistration.unregister();
}
