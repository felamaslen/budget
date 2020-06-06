import { Router } from 'express';
import joi from 'joi';

import { getSuggestions } from '~api/controllers';
import { authDbRoute } from '~api/middleware/request';
import { searchSchema } from '~api/schema';
import { SearchParams } from '~api/types';

const routeGet = authDbRoute(async (db, req, res) => {
  const { error, value: params } = joi.validate<Partial<SearchParams>>(req.params, searchSchema);
  if (error) {
    res.status(400);
    res.json({ errorMessage: error.message });
    return;
  }

  const data = await getSuggestions(db, req.user.uid, params as SearchParams);
  res.json({ data });
});

export function handler(): Router {
  const router = Router();
  router.get('/:table/:column/:searchTerm/:numResults?', routeGet);
  return router;
}
