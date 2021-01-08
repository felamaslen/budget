import Boom from '@hapi/boom';
import { Router } from 'express';

import { generateChart, Query } from '~api/controllers/preview';
import { validatedAuthDbRoute } from '~api/middleware/request';
import { previewQuerySchema } from '~api/schema';

const routePreviewMonth = validatedAuthDbRoute<void, void, Query>(
  { query: previewQuerySchema },
  async (db, req, res, _, __, query) => {
    if (!req.user?.uid) {
      throw Boom.unauthorized();
    }
    const chart = await generateChart(db, req.user.uid, query);

    res.setHeader('Content-type', 'image/png');
    chart.pipe(res);
  },
);

export function handler(): Router {
  const router = Router();
  router.get('/', routePreviewMonth);
  return router;
}