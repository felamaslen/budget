import { Router } from 'express';

import { handler as data } from './data';
import { handler as pivotTable } from './pivot-table';
import { handler as preview } from './preview';

import { authMiddleware } from '~api/modules/auth';

export default function handler(): Router {
  const router = Router();

  router.use('/data', data());

  router.use('/pivot-table', authMiddleware, pivotTable());
  router.use('/preview', authMiddleware, preview());

  return router;
}
