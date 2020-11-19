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
import { handler as routePie } from './pie';
import { handler as routeStocks } from './stocks';

import { authMiddleware } from '~api/modules/auth';
import { handler as routeNetWorth } from '~api/routes/net-worth';
import { handler as routeSearch } from '~api/routes/search';

export function handler(databaseName?: string): Router {
  const router = Router();

  router.use('/*', authMiddleware());

  router.patch('/multiple', routePatch(databaseName));

  router.use('/search', routeSearch(databaseName));
  router.use('/net-worth', routeNetWorth(databaseName));
  router.use('/overview', routeOverview(databaseName));
  router.use('/analysis', routeAnalysis(databaseName));

  router.use('/funds', routeFunds(databaseName));

  router.use('/income', routeIncome(databaseName));
  router.use('/bills', routeBills(databaseName));
  router.use('/food', routeFood(databaseName));
  router.use('/general', routeGeneral(databaseName));
  router.use('/holiday', routeHoliday(databaseName));
  router.use('/social', routeSocial(databaseName));

  router.get('/all', routeAll(databaseName));

  router.use('/pie', routePie(databaseName));
  router.use('/stocks', routeStocks(databaseName));

  return router;
}
