import React from 'react';
import { hydrate } from 'react-dom';
import { BrowserRouter } from 'react-router-dom';

import App from '~/components/app';
import '~/images/favicon.png';

function renderApp(Component = App): void {
  hydrate(
    <BrowserRouter>
      <Component />
    </BrowserRouter>,
    document.getElementById('root'),
  );
}

if (process.env.NODE_ENV !== 'test') {
  renderApp();
}

if (module.hot) {
  module.hot.accept(
    './components/app',
    // eslint-disable-next-line global-require
    () => renderApp(require('./components/app').default),
  );
}
