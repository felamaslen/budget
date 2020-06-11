import { Router } from 'express';

import { routeGet as routeAll } from './all';
import { handler as routeAnalysis } from './analysis';
import { handler as routeFunds } from './funds';
import {
  routeIncome,
  routeBills,
  routeFood,
  routeGeneral,
  routeHoliday,
  routeSocial,
} from './list';
import { routePatch } from './multiple';
import { handler as routeOverview } from './overview';
import * as pie from './pie';
import * as stocks from './stocks';

import config from '~api/config';
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

  router.use('/funds', routeFunds());

  router.use('/income', routeIncome);
  router.use('/bills', routeBills);
  router.use('/food', routeFood);
  router.use('/general', routeGeneral);
  router.use('/holiday', routeHoliday);
  router.use('/social', routeSocial);

  router.get('/all', routeAll);

  // pie charts
  router.get('/pie/:category', pie.routeGet(config, db));

  // stocks route
  router.get('/stocks', stocks.routeGet(config, db));

  return router;
}
