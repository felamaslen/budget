import { Router } from 'express';

import { makeCreateItem, makeReadItem, makeUpdateItem, makeDeleteItem } from './controller';
import { Noop, CrudOptions, CrudRouteFactory } from './types';
import { validatedAuthDbRoute } from '~api/middleware/request';
import { idParamSchemaOptional, idParamSchemaRequired } from '~api/schema';
import { PickPartial, Create, Item } from '~api/types';

export function makeCrudRoute<D extends Item = Item, J extends Item = D>(
  options: PickPartial<CrudOptions<D, J>, 'jsonToDb' | 'dbToJson'>,
): CrudRouteFactory {
  const noopD: Noop<Create<J>, D> = (value) => (value as object) as D;
  const noopJ: Noop<D, J> = (value) => (value as object) as J;
  const optionsWithDefaults: CrudOptions<D, J> = {
    ...options,
    jsonToDb: options.jsonToDb ?? noopD,
    dbToJson: options.dbToJson ?? noopJ,
  };

  const createItem = makeCreateItem(optionsWithDefaults);
  const readItem = makeReadItem(optionsWithDefaults);
  const updateItem = makeUpdateItem(optionsWithDefaults);
  const deleteItem = makeDeleteItem(optionsWithDefaults);

  const routePost = validatedAuthDbRoute<Create<J>>(
    { data: options.schema },
    async (db, _, res, data) => {
      const response = await createItem(db, data);
      res.status(201);
      res.json(response);
    },
  );

  const routeGet = validatedAuthDbRoute<never, Partial<Item>>(
    {
      params: idParamSchemaOptional,
    },
    async (db, _, res, __, params) => {
      const data = await readItem(db, params.id);
      res.json(data);
    },
  );

  const routePut = validatedAuthDbRoute<Create<J>, Item>(
    { data: options.schema, params: idParamSchemaRequired },
    async (db, _, res, data, params) => {
      const response = await updateItem(db, params.id, data);
      res.json(response);
    },
  );

  const routeDelete = validatedAuthDbRoute<never, Item>(
    {
      params: idParamSchemaRequired,
    },
    async (db, _, res, __, params) => {
      await deleteItem(db, params.id);
      res.status(204);
      res.end();
    },
  );

  return (router: Router = Router(), prefix = ''): Router => {
    router.post(`${prefix}/`, routePost);
    router.get(`${prefix}/:id?`, routeGet);
    router.put(`${prefix}/:id`, routePut);
    router.delete(`${prefix}/:id`, routeDelete);

    return router;
  };
}
