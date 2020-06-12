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

  router.use('/pie', routePie());
  router.use('/stocks', routeStocks());

  return router;
}
