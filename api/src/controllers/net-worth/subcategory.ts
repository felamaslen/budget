import * as Boom from '@hapi/boom';

import { makeCrudController } from '~api/modules/crud';
import { PubSubTopic } from '~api/modules/graphql/pubsub';
import { DJMap, mapExternalToInternal, mapInternalToExternal } from '~api/modules/key-map';
import { Create, NetWorthSubcategory, SubcategoryRow, CategoryRow } from '~api/types';

const dbMap = [
  { external: 'categoryId', internal: 'category_id' },
  { external: 'hasCreditLimit', internal: 'has_credit_limit' },
  { external: 'isSAYE', internal: 'is_saye' },
];

export const netWorthSubcategory = makeCrudController<
  SubcategoryRow,
  NetWorthSubcategory,
  CategoryRow
>({
  table: 'net_worth_subcategories',
  item: 'Subcategory',
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
  createTopic: PubSubTopic.NetWorthSubcategoryCreated,
  updateTopic: PubSubTopic.NetWorthSubcategoryUpdated,
  deleteTopic: PubSubTopic.NetWorthSubcategoryDeleted,
});
