import { Router } from 'express';

import { makeCrudRoute } from '~api/modules/crud';
import { schemaCategory } from '~api/schema/net-worth';

const table = 'net_worth_categories';
const item = 'Category';

export const routeCategories: () => Router = makeCrudRoute({
  table,
  item,
  schema: schemaCategory,
});
