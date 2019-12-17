import path from 'path';
import Koa, { Context } from 'koa';
import createRouter from 'koa-joi-router';
import serve from 'koa-static';
import React from 'react';
import { renderToString } from 'react-dom/server';
import { StaticRouter } from 'react-router-dom';
import { ServerStyleSheet } from 'styled-components';
import { createMemoryHistory } from 'history';
import { Provider } from 'react-redux';

import config from '~/server/config';
import { getPreloadedState } from '~/server/modules/state';
import { PreloadedState } from '~/reducers';
import configureStore from '~/store';
import App from '~/components/app/index';
import favicon from '~/images/favicon.png';

async function serveApp(ctx: Context): Promise<void> {
  const history = createMemoryHistory({
    initialEntries: [ctx.request.url],
  });

  const preloadedState: PreloadedState = await getPreloadedState(ctx.session, ctx.request.url);
  if (!(preloadedState.login && preloadedState.login.uid)) {
    ctx.session = null;
  }

  const store = configureStore(preloadedState, history, false);

  const sheet = new ServerStyleSheet();

  const html = renderToString(
    sheet.collectStyles(
      <Provider store={store}>
        <StaticRouter location={ctx.request.url}>
          <App />
        </StaticRouter>
      </Provider>,
    ),
  );

  const styleTags = sheet.getStyleTags();

  ctx.body = `
<!doctype html>
<html>
  <head>
    <title>Budget</title>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, user-scalable=no, initial-scale=1.0">
    <link rel="icon" href="${favicon}" type="image/png" />
    ${styleTags}
  </head>
  <body>
    <div id="root">${html}</div>
    <script>var __PRELOADED_STATE__=${JSON.stringify(preloadedState)};</script>
    <script src="/assets/bundle.js?v=${config.version}"></script>
  </body>
</html>
  `;

  ctx.status = 200;
}

export default function appRoute(app: Koa): void {
  if (process.env.NODE_ENV === 'development') {
    /* eslint-disable global-require, @typescript-eslint/no-var-requires, import/no-extraneous-dependencies */
    const compiler = require('webpack')(require('../../../webpack.config'));

    app.use(require('koa-webpack-dev-middleware')(compiler));
    app.use(require('koa-webpack-hot-middleware')(compiler));
    /* eslint-enable global-require, @typescript-eslint/no-var-requires, import/no-extraneous-dependencies */
  }

  app.use(
    serve(path.resolve(__dirname, '../../public'), {
      maxage: config.prod ? 86400 * 30 : 0,
      gzip: true,
      index: false,
    }),
  );

  const router = createRouter();

  router.route({
    method: 'get',
    path: '/',
    handler: serveApp,
  });

  router.route({
    method: 'get',
    path: '/*',
    handler: serveApp,
  });

  app.use(router.middleware());
}
