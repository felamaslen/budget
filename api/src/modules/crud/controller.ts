import boom from '@hapi/boom';
import { DatabaseTransactionConnectionType } from 'slonik';

import {
  insertCrudItem,
  selectCrudItem,
  selectAllCrudItems,
  updateCrudItem,
  deleteCrudItem,
  getRowCount,
} from './queries';
import { Item, CrudOptions, ParentDependency } from './types';
import { Create } from '~api/types';

const notFoundError = (item: string): Error => boom.notFound(`${item} not found`);

async function checkParentDependency<J extends Item>(
  db: DatabaseTransactionConnectionType,
  data: Create<J>,
  parentDependency?: ParentDependency<J>,
): Promise<void> {
  if (!parentDependency) {
    return;
  }
  const rowCount = await getRowCount(db, parentDependency.table, data[parentDependency.key]);
  if (!rowCount) {
    throw notFoundError(parentDependency.item);
  }
}

export const makeCreateItem = <D extends Item, J extends Item>({
  table,
  jsonToDb,
  dbToJson,
  parentDependency,
}: CrudOptions<D, J>) => async (
  db: DatabaseTransactionConnectionType,
  data: Create<J>,
): Promise<J> => {
  await checkParentDependency(db, data, parentDependency);
  const rowData = jsonToDb(data);
  const createdRow = await insertCrudItem(db, table, rowData);
  return dbToJson(createdRow);
};

export const makeReadItem = <D extends Item, J extends Item>({
  table,
  dbToJson,
  item,
}: CrudOptions<D, J>) => async (
  db: DatabaseTransactionConnectionType,
  id?: string,
): Promise<J | J[]> => {
  if (id) {
    const rowData = await selectCrudItem<D>(db, table, id);
    if (!rowData) {
      throw notFoundError(item);
    }
    return dbToJson(rowData);
  }

  const rowData = await selectAllCrudItems<D>(db, table);
  return rowData.map(dbToJson);
};

export const makeUpdateItem = <D extends Item, J extends Item>({
  table,
  jsonToDb,
  dbToJson,
  item,
  parentDependency,
}: CrudOptions<D, J>) => async (
  db: DatabaseTransactionConnectionType,
  id: string,
  data: Create<J>,
): Promise<J> => {
  await checkParentDependency(db, data, parentDependency);
  const rowData = jsonToDb(data);
  const updatedRow = await updateCrudItem<D>(db, table, id, rowData);
  if (!updatedRow) {
    throw notFoundError(item);
  }
  return dbToJson(updatedRow);
};

export const makeDeleteItem = <D extends Item, J extends Item>({
  table,
  item,
}: CrudOptions<D, J>) => async (
  db: DatabaseTransactionConnectionType,
  id: string,
): Promise<void> => {
  const numDeleted = await deleteCrudItem(db, table, id);
  if (!numDeleted) {
    throw notFoundError(item);
  }
};
