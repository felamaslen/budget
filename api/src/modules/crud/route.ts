import { Router } from 'express';

import { makeCreateItem, makeReadItem, makeUpdateItem, makeDeleteItem } from './controller';
import { Item, Noop, CrudOptions, CrudRouteFactory } from './types';
import { validatedAuthDbRoute, authDbRoute } from '~api/middleware/request';
import { PickPartial, Create } from '~api/types';

// export const checkItem = (
//   table: string,
//   item: string,
//   getId: GetId = (req: AuthenticatedRequest): string => req.params.id,
// ): RequestHandler => {
//   const getItem = makeGetItem(table, item, noop);
//
//   return catchAsyncErrors<Request>(async (req: Request, _: Response, next: NextFunction) => {
//     await getItem(getId(req));
//
//     next();
//   });
// };

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

  const routeGet = authDbRoute(async (db, req, res) => {
    const data = await readItem(db, req.params.id);
    res.json(data);
  });

  const routePut = validatedAuthDbRoute<Create<J>>(
    { data: options.schema },
    async (db, req, res, data) => {
      const response = await updateItem(db, req.params.id, data);
      res.json(response);
    },
  );

  const routeDelete = authDbRoute(async (db, req, res) => {
    await deleteItem(db, req.params.id);
    res.status(204);
    res.end();
  });

  return (router: Router = Router(), prefix = ''): Router => {
    router.post(`${prefix}/`, routePost);
    router.get(`${prefix}/:id?`, routeGet);
    router.put(`${prefix}/:id`, routePut);
    router.delete(`${prefix}/:id`, routeDelete);

    return router;
  };
}
