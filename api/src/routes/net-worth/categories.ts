import { Router } from 'express';

import { makeCrudRoute } from '~api/modules/crud';
import { schemaCategory } from '~api/schema/net-worth';
import { DJMap, mapExternalToInternal, mapInternalToExternal } from '~api/modules/key-map';
import { Category, CategoryRow } from './types';

const table = 'net_worth_categories';
const item = 'Category';

const dbMap: DJMap<CategoryRow> = [{ external: 'isOption', internal: 'is_option' }];

export const routeCategories: () => Router = makeCrudRoute<CategoryRow, Category>({
  table,
  item,
  schema: schemaCategory,
  jsonToDb: mapExternalToInternal(dbMap),
  dbToJson: mapInternalToExternal<CategoryRow, Category>(dbMap),
});
