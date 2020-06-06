import { Router } from 'express';

import { routeGet as routeAll } from './all';
import { handler as routeAnalysis } from './analysis';
import { handler as routeOverview } from './overview';
import * as pie from './pie';
import * as stocks from './stocks';

import config from '~api/config';
import { listDataProcessor, routePatch } from '~api/middleware/multiple-update-request';
import { authMiddleware } from '~api/modules/auth';
import db from '~api/modules/db';
import { netWorthRoute } from '~api/routes/net-worth';
import { handler as routeSearch } from '~api/routes/search';

export function handler(): Router {
  const router = Router();

  router.use('/*', authMiddleware());

  router.patch('/multiple', routePatch);

  router.use('/search', routeSearch());
  router.use('/net-worth', netWorthRoute());
  router.use('/overview', routeOverview());
  router.use('/analysis', routeAnalysis());

  // list data routes
  config.data.listCategories.forEach((category) => {
    const pageParam = category === 'funds' ? '' : '/:page?';

    router.get(`/${category}${pageParam}`, listDataProcessor[category].routeGet(config, db));
    router.post(`/${category}`, listDataProcessor[category].routePost(config, db));
    router.put(`/${category}`, listDataProcessor[category].routePut(config, db));
    router.delete(`/${category}`, listDataProcessor[category].routeDelete(config, db));
  });

  router.get('/all', routeAll);

  // pie charts
  router.get('/pie/:category', pie.routeGet(config, db));

  // stocks route
  router.get('/stocks', stocks.routeGet(config, db));

  return router;
}
