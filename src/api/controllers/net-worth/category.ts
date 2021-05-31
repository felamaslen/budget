import { makeCrudController } from '~api/modules/crud';
import { PubSubTopic } from '~api/modules/graphql/pubsub';
import type { NetWorthCategory, CategoryRow } from '~api/types';

const table = 'net_worth_categories';
const item = 'Category';

export const netWorthCategory = makeCrudController<CategoryRow, NetWorthCategory>({
  table,
  item,
  dbMap: [{ external: 'isOption', internal: 'is_option' }],
  withUid: true,
  createTopic: PubSubTopic.NetWorthCategoryCreated,
  updateTopic: PubSubTopic.NetWorthCategoryUpdated,
  deleteTopic: PubSubTopic.NetWorthCategoryDeleted,
});
