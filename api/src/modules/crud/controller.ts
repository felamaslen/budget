import boom from '@hapi/boom';
import { DatabaseTransactionConnectionType } from 'slonik';

import {
  insertCrudItem,
  selectCrudItem,
  selectAllCrudItems,
  updateCrudItem,
  deleteCrudItem,
} from './queries';
import {
  CreateItem,
  CrudControllerFactory,
  CrudItem,
  CrudOptions,
  DeleteItem,
  Noop,
  ParentDependency,
  ReadItem,
  UpdateItem,
  ValidateParentDependency,
} from './types';

import { pubsub } from '~api/modules/graphql/pubsub';
import { Create, Item, PickPartial } from '~api/types';

const notFoundError = (item: string): Error => boom.notFound(`${item} not found`);

async function checkParentDependency<J extends CrudItem, P extends CrudItem>(
  db: DatabaseTransactionConnectionType,
  uid: number,
  data: Create<J>,
  parentDependency?: ParentDependency<J>,
  validateParentDependency?: ValidateParentDependency<J, P>,
): Promise<void> {
  if (!parentDependency) {
    return;
  }
  const parentRow = await selectCrudItem<P>(
    parentDependency.withUid ?? false,
    db,
    uid,
    parentDependency.table,
    data[parentDependency.key],
  );
  if (!parentRow) {
    throw notFoundError(parentDependency.item);
  }
  if (validateParentDependency) {
    validateParentDependency(data, parentRow);
  }
}

const withoutUid = <D extends CrudItem>({ uid, ...rest }: D & { uid?: number }): D => rest as D;

const filterTopic = (topic: string, uid: number): string => `${topic}.${uid}`;

export const makeCreateItem = <D extends CrudItem, J extends CrudItem, P extends CrudItem>({
  table: defaultTable,
  withUid = false,
  jsonToDb,
  dbToJson,
  parentDependency,
  validateParentDependency,
  createTopic,
}: CrudOptions<D, J, P>): CreateItem<J> => async (
  db: DatabaseTransactionConnectionType,
  uid: number,
  data: Create<J>,
  table = defaultTable,
): Promise<J> => {
  await checkParentDependency(db, uid, data, parentDependency, validateParentDependency);
  const rowData = jsonToDb(data);
  const createdRow = await insertCrudItem(withUid, db, uid, table, rowData);
  const createdItem = dbToJson(withoutUid(createdRow));
  if (createTopic) {
    await pubsub.publish(filterTopic(createTopic, uid), { item: createdItem });
  }
  return createdItem;
};

export const makeReadItem = <D extends CrudItem, J extends CrudItem, P extends CrudItem>({
  table: defaultTable,
  withUid = false,
  dbToJson,
  item,
}: CrudOptions<D, J, P>): ReadItem<J> => async (
  db: DatabaseTransactionConnectionType,
  uid: number,
  id?: number,
  table = defaultTable,
): Promise<J[]> => {
  if (id) {
    const rowData = await selectCrudItem<D>(withUid, db, uid, table, id);
    if (!rowData) {
      throw notFoundError(item);
    }
    return [dbToJson(withoutUid(rowData))];
  }

  const rowData = await selectAllCrudItems<D>(withUid, db, uid, table);
  return rowData.map((row) => dbToJson(withoutUid(row)));
};

export const makeUpdateItem = <D extends CrudItem, J extends CrudItem, P extends CrudItem>({
  table: defaultTable,
  withUid = false,
  jsonToDb,
  dbToJson,
  item,
  parentDependency,
  validateParentDependency,
  updateTopic,
}: CrudOptions<D, J, P>): UpdateItem<J> => async (
  db: DatabaseTransactionConnectionType,
  uid: number,
  id: number,
  data: Create<J>,
  table = defaultTable,
): Promise<J> => {
  await checkParentDependency(db, uid, data, parentDependency, validateParentDependency);
  const rowData = jsonToDb(data);
  const updatedRow = await updateCrudItem<D>(withUid, db, uid, table, id, rowData);
  if (!updatedRow) {
    throw notFoundError(item);
  }
  const updatedItem = dbToJson(withoutUid(updatedRow));
  if (updateTopic) {
    await pubsub.publish(filterTopic(updateTopic, uid), { item: updatedItem });
  }
  return updatedItem;
};

export const makeDeleteItem = <D extends CrudItem, J extends CrudItem, P extends CrudItem>({
  table: defaultTable,
  withUid = false,
  item,
  deleteTopic,
}: CrudOptions<D, J, P>): DeleteItem => async (
  db: DatabaseTransactionConnectionType,
  uid: number,
  id: number,
  table = defaultTable,
): Promise<void> => {
  const numDeleted = await deleteCrudItem(withUid, db, uid, table, id);
  if (!numDeleted) {
    throw notFoundError(item);
  }
  if (deleteTopic) {
    await pubsub.publish(filterTopic(deleteTopic, uid), { id });
  }
};

export function makeCrudController<
  D extends Item = Item,
  J extends Item = D,
  P extends CrudItem = CrudItem
>(options: PickPartial<CrudOptions<D, J, P>, 'jsonToDb' | 'dbToJson'>): CrudControllerFactory<J> {
  const noopD: Noop<Create<J>, D> = (value) => (value as Record<string, unknown>) as D;
  const noopJ: Noop<D, J> = (value) => (value as Record<string, unknown>) as J;
  const optionsWithDefaults: CrudOptions<D, J, P> = {
    ...options,
    jsonToDb: options.jsonToDb ?? noopD,
    dbToJson: options.dbToJson ?? noopJ,
  };

  return {
    create: makeCreateItem(optionsWithDefaults),
    read: makeReadItem(optionsWithDefaults),
    update: makeUpdateItem(optionsWithDefaults),
    delete: makeDeleteItem(optionsWithDefaults),
  };
}
