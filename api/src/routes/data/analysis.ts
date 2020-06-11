import { Router } from 'express';
import { getAnalysisData, getDeepAnalysisData } from '~api/controllers';
import { validatedAuthDbRoute } from '~api/middleware/request';
import { analysisSchema, analysisDeepSchema } from '~api/schema';
import { AnalysisParams, AnalysisParamsDeep } from '~api/types';

export const routeGet = validatedAuthDbRoute<never, AnalysisParams>(
  {
    params: analysisSchema,
  },
  async (db, req, res, _, params) => {
    const data = await getAnalysisData(db, req.user, params, new Date());
    res.json({ data });
  },
);

export const routeGetDeep = validatedAuthDbRoute<never, AnalysisParamsDeep>(
  {
    params: analysisDeepSchema,
  },
  async (db, req, res, _, params) => {
    const items = await getDeepAnalysisData(db, req.user, params, new Date());
    res.json({ data: { items } });
  },
);

export const handler = (): Router => {
  const router = Router();
  router.get('/:period/:groupBy/:pageIndex?', routeGet);
  router.get('/deep/:category/:period/:groupBy/:pageIndex?', routeGetDeep);
  return router;
};
