import path from 'path';
import Koa from 'koa';
import Router from 'koa-router';
import serve from 'koa-static';
import React from 'react';
import { renderToString } from 'react-dom/server';
import { StaticRouter } from 'react-router-dom';

import config from '~/server/config';
import App from '~/components/app/index';

async function serveApp(ctx: any): Promise<void> {
  ctx.body = `
<!doctype html>
<html>
  <head>
    <title>Budget</title>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, user-scalable=no, initial-scale=1.0">
  </head>
  <body>
    <div id="root">${renderToString(
      <StaticRouter location={ctx.request.url}>
        <App />
      </StaticRouter>,
    )}</div>
    <script src="/assets/bundle.js?v=${config.version}"></script>
  </body>
</html>
  `;

  ctx.status = 200;
}

export default function appRoute(app: Koa): void {
  if (process.env.NODE_ENV === 'development') {
    /* eslint-disable global-require, import/no-extraneous-dependencies */
    const compiler = require('webpack')(require('../../../webpack.config'));

    app.use(require('koa-webpack-dev-middleware')(compiler));
    app.use(require('koa-webpack-hot-middleware')(compiler));
    /* eslint-enable global-require, import/no-extraneous-dependencies */
  }

  app.use(
    serve(path.resolve(__dirname, '../../public'), {
      maxage: config.prod ? 86400 * 30 : 0,
      gzip: true,
      index: false,
    }),
  );

  const router = new Router();

  router.get('/', serveApp);
  router.get('/*', serveApp);

  app.use(router.routes());
}
