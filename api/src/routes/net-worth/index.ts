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
import { validatedAuthDbRoute } from '~api/middleware/request';
import { schemaNetWorth, idParamSchemaOptional, idParamSchemaRequired } from '~api/schema';
import { CreateEntry, Item } from '~api/types';

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

const routeGet = validatedAuthDbRoute<never, Partial<Item>>(
  {
    params: idParamSchemaOptional,
  },
  async (db, req, res, __, params) => {
    const response = params.id
      ? await readNetWorthEntry(db, req.user.uid, params.id)
      : await readAllNetWorthEntries(db, req.user.uid);

    res.json(response);
  },
);

const routePut = validatedAuthDbRoute<CreateEntry, Item>(
  {
    data: schemaNetWorth,
    params: idParamSchemaRequired,
  },
  async (db, req, res, data, params) => {
    const response = await updateNetWorthEntry(db, req.user.uid, params.id, data);
    res.json(response);
  },
);

const routeDelete = validatedAuthDbRoute<never, Item>(
  { params: idParamSchemaRequired },
  async (db, req, res, _, params) => {
    await deleteNetWorthEntry(db, req.user.uid, params.id);
    res.status(204);
    res.end();
  },
);

export function handler(databaseName?: string): Router {
  const router = Router();

  router.use('/categories', routeCategories(databaseName)());
  router.use('/subcategories', routeSubCategories(databaseName)());

  router.post('/', routePost(databaseName));
  router.get('/:id?', routeGet(databaseName));
  router.put('/:id', routePut(databaseName));
  router.delete('/:id', routeDelete(databaseName));

  return router;
}
