import { Router } from 'express';

import { handler as data } from './data';
import { handler as pivotTable } from './pivot-table';
import { handler as user } from './user';

import { authMiddleware } from '~api/modules/auth';

export default function handler(): Router {
  const router = Router();

  router.use('/user', user());
  router.use('/data', data());

  router.use('/pivot-table', authMiddleware(), pivotTable());

  return router;
}
