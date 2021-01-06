import { Router } from 'express';

import { handler as routePie } from './pie';

import { authMiddleware } from '~api/modules/auth';

export function handler(): Router {
  const router = Router();
  router.use('/pie', authMiddleware, routePie());
  return router;
}
