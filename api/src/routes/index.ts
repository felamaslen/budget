import { Router } from 'express';

import db from '~api/modules/db';
import { catchAsyncErrors } from '~api/modules/error-handling';
import * as data from '~api/routes/data';
import { handler as userHandler } from '~api/routes/user';
import getPivotTable from '~api/routes/pivot-table';

export function handler(): Router {
  const router = Router();

  router.use('/user', userHandler());
  router.use('/data', data.handler());

  router.use('/pivot-table', catchAsyncErrors(getPivotTable(db)));

  return router;
}
