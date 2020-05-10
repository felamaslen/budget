import * as boom from '@hapi/boom';
import { Router, Request, Response, NextFunction, RequestHandler } from 'express';
import { Schema } from 'joi';

import db from '~api/modules/db';
import { catchAsyncErrors } from '~api/modules/error-handling';
import { validate } from '~api/modules/validate';

type Noop<I extends object = object, O extends object = I> = (value: I) => O;
const noop: Noop = value => value;

type DbToJson<D extends object, J extends object> = ((value: D) => J) | Noop<J>;

type JsonToDb<D extends object, J extends object> =
  | ((body: Partial<J>, params: Partial<J>) => Partial<D>)
  | Noop<Partial<J>, D>;

type GetItem = (id: string) => Promise<object>;

type RequestWithBody<J extends object = object> = Request & {
  body: Partial<J>;
  params: Partial<J>;
};

function makeGetItem<D extends object, J extends object>(
  table: string,
  item: string,
  dbToJson: DbToJson<D, J>,
): GetItem {
  return async (id): Promise<object> => {
    const [data] = await db
      .select()
      .from(table)
      .where({ id });

    if (!data) {
      throw boom.notFound(`${item} not found`);
    }

    return dbToJson(data);
  };
}

type GetId = (req: Request) => string;

export const checkItem = (
  table: string,
  item: string,
  getId: GetId = (req: Request): string => req.params.id,
): RequestHandler => {
  const getItem = makeGetItem(table, item, noop);

  return catchAsyncErrors<Request>(async (req: Request, _: Response, next: NextFunction) => {
    await getItem(getId(req));

    next();
  });
};

function onCreate<D extends object, J extends object>(
  table: string,
  jsonToDb: JsonToDb<D, J>,
  getItem: GetItem,
): RequestHandler {
  return catchAsyncErrors(async (req: Request, res: Response) => {
    const data = jsonToDb(req.body, (req as RequestWithBody<J>).params);

    const [id] = await db
      .insert(data)
      .returning('id')
      .into(table);

    const newItem = await getItem(id);

    res.status(201).json(newItem);
  });
}

function onRead<D extends object, J extends object>(
  table: string,
  getItem: GetItem,
  dbToJson: DbToJson<D, J>,
): RequestHandler {
  return catchAsyncErrors<RequestWithBody>(
    async (req: RequestWithBody, res: Response): Promise<void> => {
      if (req.params.id) {
        const data = await getItem(req.params.id);
        res.json(data);
        return;
      }

      const data = await db.select<D>().from(table);
      const items: J[] = data.map(dbToJson);

      res.json(items);
    },
  );
}

function onUpdate<D extends object, J extends object>(
  table: string,
  getItem: GetItem,
  jsonToDb: JsonToDb<D, J>,
): RequestHandler {
  return catchAsyncErrors(async (req: RequestWithBody, res: Response) => {
    await getItem(req.params.id);

    const data = jsonToDb(req.body, req.params);

    await db(table)
      .update(data)
      .where({ id: req.params.id });

    const updated = await getItem(req.params.id);

    res.json(updated);
  });
}

const onDelete = (table: string, getItem: GetItem): RequestHandler =>
  catchAsyncErrors<RequestWithBody>(async (req: RequestWithBody, res: Response) => {
    await getItem(req.params.id);
    await db(table)
      .where({ id: req.params.id })
      .delete();

    res.status(204).end();
  });

type CrudOptions<D extends object, J extends object> = {
  table: string;
  item: string;
  schema: Schema;
  jsonToDb?: JsonToDb<D, J>;
  dbToJson?: DbToJson<D, J>;
};

type CrudRouteFactory = (router?: Router, prefix?: string) => Router;

export function makeCrudRoute<D extends object = object, J extends object = D>({
  table,
  item,
  schema,
  ...options
}: CrudOptions<D, J>): CrudRouteFactory {
  const noopD: Noop<Partial<J>, D> = value => value as D;
  const noopJ: Noop<J> = value => value;

  const jsonToDb = options.jsonToDb || noopD;
  const dbToJson = options.dbToJson || noopJ;

  const getItem = makeGetItem(table, item, dbToJson);

  return (router: Router = Router(), prefix = ''): Router => {
    router.post(`${prefix}/`, validate(schema), onCreate(table, jsonToDb, getItem));

    router.get(`${prefix}/:id?`, onRead(table, getItem, dbToJson));

    router.put(`${prefix}/:id`, validate(schema), onUpdate(table, getItem, jsonToDb));

    router.delete(`${prefix}/:id`, onDelete(table, getItem));

    return router;
  };
}
