import { Router } from 'express';

import { getSuggestions } from '~api/controllers';
import { validatedAuthDbRoute } from '~api/middleware/request';
import { searchSchema } from '~api/schema';
import { SearchParams } from '~api/types';

const routeGet = validatedAuthDbRoute<never, SearchParams>(
  {
    params: searchSchema,
  },
  async (db, req, res, _, params) => {
    const data = await getSuggestions(db, req.user.uid, params);
    res.json({ data });
  },
);

export function handler(): Router {
  const router = Router();
  router.get('/:table/:column/:searchTerm/:numResults?', routeGet);
  return router;
}
