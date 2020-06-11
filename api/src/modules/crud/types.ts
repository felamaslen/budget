import { Schema } from '@hapi/joi';
import { Router } from 'express';
import { AuthenticatedRequest } from '~api/modules/auth';
import { Create } from '~api/types';

export interface Item {
  id: string;
  [key: string]: any; // eslint-disable-line @typescript-eslint/no-explicit-any
}

export type Noop<I extends object = object, O extends object = I> = (value: I) => O;

export type DbToJson<D extends Item, J extends Item> = ((value: D) => J) | Noop<D, J>;

export type JsonToDb<D extends Item, J extends Item> =
  | ((body: Create<J>) => Create<D>)
  | Noop<Partial<Create<J>>, Create<D>>;

export type GetItem = (id: string) => Promise<object>;

export type RequestWithBody<J extends Item = Item> = AuthenticatedRequest & {
  body: Partial<J>;
  params: Partial<J>;
};

export type GetId = (req: AuthenticatedRequest) => string;

export type ParentDependency<J extends Item> = {
  item: string;
  table: string;
  key: keyof Create<J>;
};

export type CrudOptions<D extends Item, J extends Item> = {
  table: string;
  item: string;
  schema: Schema;
  jsonToDb: JsonToDb<D, J>;
  dbToJson: DbToJson<D, J>;
  parentDependency?: ParentDependency<J>;
};

export type CrudRouteFactory = (router?: Router, prefix?: string) => Router;
