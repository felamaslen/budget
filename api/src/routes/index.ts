import { Router } from 'express';

import { catchAsyncErrors } from '~api/modules/error-handling';
import config from '~api/config';
import db from '~api/modules/db';
import logger from '~api/modules/logger';
import * as data from './data';
import { handler as user } from './user';
import getPivotTable from './pivot-table';

export default function handler(): Router {
  const router = Router();

  router.use('/user', user());
  router.use('/data', data.handler(config, db, logger));

  router.use('/pivot-table', catchAsyncErrors(getPivotTable));

  return router;
}
