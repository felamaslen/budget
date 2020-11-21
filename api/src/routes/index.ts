import { Router } from 'express';

import { handler as data } from './data';
import { handler as pivotTable } from './pivot-table';
import { handler as preview } from './preview';

import { authMiddleware } from '~api/modules/auth';

export default function handler(databaseName?: string): Router {
  const router = Router();

  router.use('/data', data(databaseName));

  router.use('/pivot-table', authMiddleware(), pivotTable(databaseName));
  router.use('/preview', authMiddleware(), preview(databaseName));

  return router;
}
