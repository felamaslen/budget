import { Request } from 'express';
import { DatabaseTransactionConnectionType } from 'slonik';

import { Create, Item } from '~api/types';

export interface CrudItem extends Item {
  [key: string]: any; // eslint-disable-line @typescript-eslint/no-explicit-any
}

export type Noop<
  I extends Record<string, unknown> = Record<string, unknown>,
  O extends Record<string, unknown> = I
> = (value: I) => O;

export type DbToJson<D extends Item, J extends Item> = ((value: D) => J) | Noop<D, J>;

export type JsonToDb<D extends Item, J extends Item> =
  | ((body: Create<J>) => Create<D>)
  | Noop<Partial<Create<J>>, Create<D>>;

export type GetItem = (id: number) => Promise<Record<string, unknown>>;

export type RequestWithBody<J extends Item = Item> = Request & {
  body: Partial<J>;
  params: Partial<J>;
};

export type GetId = (req: Request) => string;

export type ParentDependency<J extends Item> = {
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
  jsonToDb: JsonToDb<D, J>;
  dbToJson: DbToJson<D, J>;
  parentDependency?: ParentDependency<J>;
  validateParentDependency?: ValidateParentDependency<J, P>;
  createTopic?: string;
  updateTopic?: string;
  deleteTopic?: string;
};

export type CreateItem<J extends CrudItem> = (
  db: DatabaseTransactionConnectionType,
  uid: number,
  data: Create<J>,
  table?: string,
) => Promise<J>;

export type ReadItem<J extends CrudItem> = (
  db: DatabaseTransactionConnectionType,
  uid: number,
  id?: number,
  table?: string,
) => Promise<J[]>;

export type UpdateItem<J extends CrudItem> = (
  db: DatabaseTransactionConnectionType,
  uid: number,
  id: number,
  data: Create<J>,
  table?: string,
) => Promise<J>;

export type DeleteItem = (
  db: DatabaseTransactionConnectionType,
  uid: number,
  id: number,
  table?: string,
) => Promise<void>;

export type CrudControllerFactory<J extends CrudItem> = {
  create: CreateItem<J>;
  read: ReadItem<J>;
  update: UpdateItem<J>;
  delete: DeleteItem;
};
