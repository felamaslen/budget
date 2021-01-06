import { Request, RequestHandler, Response } from 'express';
import isObject from 'lodash/isObject';

import { renderApp, RenderedApp } from './render';
import { catchAsyncErrors } from '~api/modules/error-handling';

function normalizeAssets(assets: Record<string, string> | string[] | string): string[] {
  if (isObject(assets)) {
    return Object.values(assets);
  }
  return Array.isArray(assets) ? assets : [assets];
}

function renderDevApp(req: Request, res: Response, renderedApp: RenderedApp): void {
  const { devMiddleware } = res.locals.webpack;
  const jsonWebpackStats = devMiddleware.stats.toJson();
  const { assetsByChunkName } = jsonWebpackStats;

  const hasLoadableStats = jsonWebpackStats.assets.some(
    ({ name }: { name: string }) => name === 'loadable-stats-dev.json',
  );

  const scriptTags = hasLoadableStats
    ? renderedApp.scriptTags
    : normalizeAssets(assetsByChunkName.main)
        .filter((path) => path.endsWith('.js') || path.endsWith('.mjs'))
        .map((path) => `<script src="${path}"></script>`)
        .join('\n');

  res.render('index', { ...renderedApp, scriptTags });
}

export const makeSinglePageApp = (hot: boolean): RequestHandler =>
  catchAsyncErrors(
    async (req: Request, res: Response): Promise<void> => {
      const renderedApp = await renderApp(req, hot);

      if (hot) {
        renderDevApp(req, res, renderedApp);
      } else {
        res.render('index', renderedApp);
      }
    },
  );
