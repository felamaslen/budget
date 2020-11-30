import * as Boom from '@hapi/boom';

import { makeCrudRoute } from '~api/modules/crud';
import { DJMap, mapExternalToInternal, mapInternalToExternal } from '~api/modules/key-map';
import { schemaSubcategory } from '~api/schema';
import { CategoryRow, Create, Subcategory, SubcategoryRow } from '~api/types';

const dbMap = [
  { external: 'categoryId', internal: 'category_id' },
  { external: 'hasCreditLimit', internal: 'has_credit_limit' },
  { external: 'isSAYE', internal: 'is_saye' },
];

export const routeSubCategories = makeCrudRoute<SubcategoryRow, Subcategory, CategoryRow>({
  table: 'net_worth_subcategories',
  item: 'Subcategory',
  schema: schemaSubcategory,
  jsonToDb: mapExternalToInternal(dbMap as DJMap<Create<SubcategoryRow>>),
  dbToJson: mapInternalToExternal(dbMap as DJMap<SubcategoryRow>),
  parentDependency: {
    item: 'Category',
    table: 'net_worth_categories',
    withUid: true,
    key: 'categoryId',
  },
  validateParentDependency: (subcategory, category) => {
    if (category.is_option && subcategory.isSAYE === null) {
      throw Boom.badRequest('Must set isSAYE for options');
    }
    if (!category.is_option && subcategory.isSAYE !== null) {
      throw Boom.badRequest('Cannot set isSAYE for non-option subcategories');
    }
  },
});
