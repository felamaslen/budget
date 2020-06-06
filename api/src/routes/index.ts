import { Router } from 'express';

import { handler as data } from './data';
import getPivotTable from './pivot-table';
import { handler as user } from './user';

import { catchAsyncErrors } from '~api/modules/error-handling';

export default function handler(): Router {
  const router = Router();

  router.use('/user', user());
  router.use('/data', data());

  router.use('/pivot-table', catchAsyncErrors(getPivotTable));

  return router;
}
