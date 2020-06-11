import { Router } from 'express';

import { routeCategories } from './categories';
import { routeSubCategories } from './subcategories';
import {
  createNetWorthEntry,
  readNetWorthEntry,
  readAllNetWorthEntries,
  updateNetWorthEntry,
  deleteNetWorthEntry,
} from '~api/controllers';
import { authDbRoute, validatedAuthDbRoute } from '~api/middleware/request';
import { schemaNetWorth } from '~api/schema';
import { CreateEntry } from '~api/types';

const routePost = validatedAuthDbRoute<CreateEntry>(
  {
    data: schemaNetWorth,
  },
  async (db, req, res, data) => {
    const response = await createNetWorthEntry(db, req.user.uid, data);
    res.status(201);
    res.json(response);
  },
);

const routeGet = authDbRoute(async (db, req, res) => {
  const response = req.params.id
    ? await readNetWorthEntry(db, req.user.uid, req.params.id)
    : await readAllNetWorthEntries(db, req.user.uid);

  res.json(response);
});

const routePut = validatedAuthDbRoute<CreateEntry>(
  {
    data: schemaNetWorth,
  },
  async (db, req, res, data) => {
    const response = await updateNetWorthEntry(db, req.user.uid, req.params.id, data);
    res.json(response);
  },
);

const routeDelete = authDbRoute(async (db, req, res) => {
  await deleteNetWorthEntry(db, req.user.uid, req.params.id);
  res.status(204);
  res.end();
});

export function netWorthRoute(): Router {
  const router = Router();

  router.use('/categories', routeCategories());
  router.use('/subcategories', routeSubCategories());

  router.post('/', routePost);
  router.get('/:id?', routeGet);
  router.put('/:id', routePut);
  router.delete('/:id', routeDelete);

  return router;
}
