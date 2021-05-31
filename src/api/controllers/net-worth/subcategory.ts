import * as Boom from '@hapi/boom';

import { makeCrudController } from '~api/modules/crud';
import { PubSubTopic } from '~api/modules/graphql/pubsub';
import { NetWorthSubcategory, SubcategoryRow, CategoryRow, NetWorthCategoryType } from '~api/types';

export const netWorthSubcategory = makeCrudController<
  SubcategoryRow,
  NetWorthSubcategory,
  CategoryRow
>({
  table: 'net_worth_subcategories',
  item: 'Subcategory',
  dbMap: [
    { external: 'categoryId', internal: 'category_id' },
    { external: 'hasCreditLimit', internal: 'has_credit_limit' },
    { external: 'appreciationRate', internal: 'appreciation_rate' },
    { external: 'isSAYE', internal: 'is_saye' },
  ],
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
    if (
      !(category.type === NetWorthCategoryType.Asset && !category.is_option) &&
      subcategory.appreciationRate
    ) {
      throw Boom.badRequest('Cannot set appreciation rate of a non-illiquid asset');
    }
    if (subcategory.appreciationRate && subcategory.appreciationRate <= -100) {
      throw Boom.badRequest('Cannot set appreciation rate less than -100%');
    }
  },
  createTopic: PubSubTopic.NetWorthSubcategoryCreated,
  updateTopic: PubSubTopic.NetWorthSubcategoryUpdated,
  deleteTopic: PubSubTopic.NetWorthSubcategoryDeleted,
});
