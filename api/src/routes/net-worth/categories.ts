import { Router } from 'express';

import { makeCrudRoute } from '~api/modules/crud';
import { DJMap, mapExternalToInternal, mapInternalToExternal } from '~api/modules/key-map';
import { schemaCategory } from '~api/schema';
import { Create, Category, CategoryRow } from '~api/types';

const table = 'net_worth_categories';
const item = 'Category';

const dbMap = [{ external: 'isOption', internal: 'is_option' }];

export const routeCategories: () => Router = makeCrudRoute<CategoryRow, Category>({
  table,
  item,
  schema: schemaCategory,
  jsonToDb: mapExternalToInternal(dbMap as DJMap<Create<CategoryRow>>),
  dbToJson: mapInternalToExternal(dbMap as DJMap<CategoryRow>),
  withUid: true,
});
