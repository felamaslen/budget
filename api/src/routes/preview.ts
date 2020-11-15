import { Router } from 'express';

import { generateChart } from '~api/controllers/preview';
import { validatedAuthDbRoute } from '~api/middleware/request';
import { previewQuerySchema } from '~api/schema';
import { ListCalcCategory } from '~api/types';

const routePreviewMonth = validatedAuthDbRoute<
  void,
  void,
  {
    year: number;
    month: number;
    category: ListCalcCategory;
  }
>(
  {
    query: previewQuerySchema,
  },
  async (db, req, res, _, __, query) => {
    const { year, month, category } = query;
    const chart = await generateChart(db, req.user.uid, year, month, category);

    res.setHeader('Content-type', 'image/png');
    chart.pipe(res);
  },
);

export function handler(): Router {
  const router = Router();
  router.get('/', routePreviewMonth);
  return router;
}
