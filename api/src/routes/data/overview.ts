import { Router } from 'express';
import { getOverviewData } from '~api/controllers';
import { authDbRoute } from '~api/middleware/request';

export const routeGet = authDbRoute(async (db, req, res) => {
  const data = await getOverviewData(db, req.user.uid, new Date());
  res.json({
    data,
  });
});

export const handler = (): Router => {
  const router = Router();

  router.get('/', routeGet);

  return router;
};
