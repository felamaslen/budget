import React from 'react';
import { Provider } from 'react-redux';
import { hydrate } from 'react-dom';
import { Router } from 'react-router-dom';
import { createBrowserHistory } from 'history';

import configureStore from '~/store';
import App from '~/components/app';
import '~/images/favicon.png';

const history = createBrowserHistory();
const store = configureStore({}, history);

function renderApp(Component: typeof App = App): void {
  hydrate(
    <Provider store={store}>
      <Router history={history}>
        <Component />
      </Router>
    </Provider>,
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
