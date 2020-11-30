import boom from '@hapi/boom';
import { DatabaseTransactionConnectionType } from 'slonik';

import {
  insertCrudItem,
  selectCrudItem,
  selectAllCrudItems,
  updateCrudItem,
  deleteCrudItem,
} from './queries';
import { CrudItem, CrudOptions, ParentDependency, ValidateParentDependency } from './types';
import { Create } from '~api/types';

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

export const makeCreateItem = <D extends CrudItem, J extends CrudItem, P extends CrudItem>({
  table,
  withUid = false,
  jsonToDb,
  dbToJson,
  parentDependency,
  validateParentDependency,
}: CrudOptions<D, J, P>) => async (
  db: DatabaseTransactionConnectionType,
  uid: number,
  data: Create<J>,
): Promise<J> => {
  await checkParentDependency(db, uid, data, parentDependency, validateParentDependency);
  const rowData = jsonToDb(data);
  const createdRow = await insertCrudItem(withUid, db, uid, table, rowData);
  return dbToJson(withoutUid(createdRow));
};

export const makeReadItem = <D extends CrudItem, J extends CrudItem, P extends CrudItem>({
  table,
  withUid = false,
  dbToJson,
  item,
}: CrudOptions<D, J, P>) => async (
  db: DatabaseTransactionConnectionType,
  uid: number,
  id?: number,
): Promise<J | J[]> => {
  if (id) {
    const rowData = await selectCrudItem<D>(withUid, db, uid, table, id);
    if (!rowData) {
      throw notFoundError(item);
    }
    return dbToJson(withoutUid(rowData));
  }

  const rowData = await selectAllCrudItems<D>(withUid, db, uid, table);
  return rowData.map((row) => dbToJson(withoutUid(row)));
};

export const makeUpdateItem = <D extends CrudItem, J extends CrudItem, P extends CrudItem>({
  table,
  withUid = false,
  jsonToDb,
  dbToJson,
  item,
  parentDependency,
  validateParentDependency,
}: CrudOptions<D, J, P>) => async (
  db: DatabaseTransactionConnectionType,
  uid: number,
  id: number,
  data: Create<J>,
): Promise<J> => {
  await checkParentDependency(db, uid, data, parentDependency, validateParentDependency);
  const rowData = jsonToDb(data);
  const updatedRow = await updateCrudItem<D>(withUid, db, uid, table, id, rowData);
  if (!updatedRow) {
    throw notFoundError(item);
  }
  return dbToJson(withoutUid(updatedRow));
};

export const makeDeleteItem = <D extends CrudItem, J extends CrudItem, P extends CrudItem>({
  table,
  withUid = false,
  item,
}: CrudOptions<D, J, P>) => async (
  db: DatabaseTransactionConnectionType,
  uid: number,
  id: number,
): Promise<void> => {
  const numDeleted = await deleteCrudItem(withUid, db, uid, table, id);
  if (!numDeleted) {
    throw notFoundError(item);
  }
};
