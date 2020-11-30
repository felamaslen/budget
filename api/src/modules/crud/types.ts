import { Schema } from '@hapi/joi';
import { Router } from 'express';

import { AuthenticatedRequest } from '~api/gql';
import { Create, Item } from '~api/types';

export interface CrudItem extends Item {
  [key: string]: any; // eslint-disable-line @typescript-eslint/no-explicit-any
}

export type Noop<I extends object = object, O extends object = I> = (value: I) => O;

export type DbToJson<D extends Item, J extends Item> = ((value: D) => J) | Noop<D, J>;

export type JsonToDb<D extends Item, J extends Item> =
  | ((body: Create<J>) => Create<D>)
  | Noop<Partial<Create<J>>, Create<D>>;

export type GetItem = (id: number) => Promise<object>;

export type RequestWithBody<J extends Item = Item> = AuthenticatedRequest & {
  body: Partial<J>;
  params: Partial<J>;
};

export type GetId = (req: AuthenticatedRequest) => string;

export type ParentDependency<J extends Item, P extends Item = Item> = {
  item: string;
  table: string;
  withUid?: boolean;
  key: keyof Create<J>;
};

export type ValidateParentDependency<J extends Item, P extends CrudItem> = (
  child: Create<J>,
  parent: P,
) => void;

export type CrudOptions<D extends Item, J extends Item, P extends CrudItem = CrudItem> = {
  table: string;
  withUid?: boolean;
  item: string;
  schema: Schema;
  jsonToDb: JsonToDb<D, J>;
  dbToJson: DbToJson<D, J>;
  parentDependency?: ParentDependency<J>;
  validateParentDependency?: ValidateParentDependency<J, P>;
};

export type CrudRouteFactory = (
  databaseName?: string,
) => (router?: Router, prefix?: string) => Router;
