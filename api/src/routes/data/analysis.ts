import { Router } from 'express';
import joi from 'joi';
import { getAnalysisData, getDeepAnalysisData } from '~api/controllers';
import { authDbRoute } from '~api/middleware/request';
import { analysisSchema, analysisDeepSchema } from '~api/schema';
import { AnalysisParams, AnalysisParamsDeep } from '~api/types';

export const routeGet = authDbRoute(async (db, req, res) => {
  const { error, value: params } = joi.validate<Partial<AnalysisParams>>(
    req.params,
    analysisSchema,
  );

  if (error) {
    res.status(400);
    res.json({ errorMessage: error.message });
    return;
  }

  const data = await getAnalysisData(db, req.user, params, new Date());
  res.json({ data });
});

export const routeGetDeep = authDbRoute(async (db, req, res) => {
  const { error, value: params } = joi.validate<Partial<AnalysisParamsDeep>>(
    req.params,
    analysisDeepSchema,
  );

  if (error) {
    res.status(400);
    res.json({ errorMessage: error.message });
    return;
  }

  const items = await getDeepAnalysisData(db, req.user, params as AnalysisParamsDeep, new Date());

  res.json({ data: { items } });
});

export const handler = (): Router => {
  const router = Router();

  router.get('/:period/:groupBy/:pageIndex?', routeGet);
  router.get('/deep/:category/:period/:groupBy/:pageIndex?', routeGetDeep);

  return router;
};
