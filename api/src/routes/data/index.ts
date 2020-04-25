import { Router } from 'express';

import { ListCategory, ListHandler, HandlerFactoryLegacy } from '~api/types';
import config from '~api/config';
import db from '~api/modules/db';
import { authMiddleware } from '~api/modules/auth';
import { routePatch as routeMultipleUpdate } from '../../middleware/multipleUpdateRequest';

import * as search from '~api/routes/search';

import { netWorthRoute } from '~api/routes/net-worth';

import * as cashflow from '~api/routes/data/cashflow';
import * as analysis from '~api/routes/data/analysis';
import * as analysisDeep from '~api/routes/data/analysis/deep';

import * as income from '~api/routes/data/income';
import * as bills from '~api/routes/data/bills';
import * as funds from '~api/routes/data/funds';
import * as food from '~api/routes/data/food';
import * as general from '~api/routes/data/general';
import * as social from '~api/routes/data/social';
import * as holiday from '~api/routes/data/holiday';

import * as dataAll from '~api/routes/data/all';
import * as pie from '~api/routes/data/pie';
import * as stocks from '~api/routes/data/stocks';

const listDataProcessor: {
  [key in ListCategory]: ListHandler<HandlerFactoryLegacy>;
} = {
  income,
  bills,
  funds,
  food,
  general,
  social,
  holiday,
};

export function handler(): Router {
  const router = Router();

  router.use('/*', authMiddleware);

  router.patch('/multiple', routeMultipleUpdate(config, db, listDataProcessor));

  router.use('/search', search.handler(config, db));

  router.use('/net-worth', netWorthRoute(config, db));

  // cash flow routes
  router.get('/overview', cashflow.routeGet(config, db));
  router.post('/balance', cashflow.routePost(config, db));
  router.put('/balance', cashflow.routePut(config, db));

  // analysis routes
  router.get('/analysis/:period/:groupBy/:pageIndex?', analysis.routeGet);
  router.get('/analysis/deep/:category/:period/:groupBy/:pageIndex?', analysisDeep.routeGet);

  // list data routes
  config.data.listCategories.forEach(category => {
    const pageParam = category === 'funds' ? '' : '/:page?';

    router.get(`/${category}${pageParam}`, listDataProcessor[category].routeGet(config, db));
    router.post(`/${category}`, listDataProcessor[category].routePost(config, db));
    router.put(`/${category}`, listDataProcessor[category].routePut(config, db));
    router.delete(`/${category}`, listDataProcessor[category].routeDelete(config, db));
  });

  router.get('/all', dataAll.routeGet(config, db));

  // pie charts
  router.get('/pie/:category', pie.routeGet(config, db));

  // stocks route
  router.get('/stocks', stocks.routeGet(config, db));

  return router;
}
