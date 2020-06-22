import { makeCrudRoute } from '~api/modules/crud';
import { DJMap, mapExternalToInternal, mapInternalToExternal } from '~api/modules/key-map';
import { schemaSubcategory } from '~api/schema';
import { Create, Subcategory, SubcategoryRow } from '~api/types';

const dbMap = [
  { external: 'categoryId', internal: 'category_id' },
  { external: 'hasCreditLimit', internal: 'has_credit_limit' },
];

export const routeSubCategories = makeCrudRoute<SubcategoryRow, Subcategory>({
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
});
