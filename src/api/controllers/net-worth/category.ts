import { makeCrudController } from '~api/modules/crud';
import { PubSubTopic } from '~api/modules/graphql/pubsub';
import { DJMap, mapExternalToInternal, mapInternalToExternal } from '~api/modules/key-map';
import { Create, NetWorthCategory, CategoryRow } from '~api/types';

const table = 'net_worth_categories';
const item = 'Category';

const dbMap = [{ external: 'isOption', internal: 'is_option' }];

export const netWorthCategory = makeCrudController<CategoryRow, NetWorthCategory>({
  table,
  item,
  jsonToDb: mapExternalToInternal(dbMap as DJMap<Create<CategoryRow>>),
  dbToJson: mapInternalToExternal(dbMap as DJMap<CategoryRow>),
  withUid: true,
  createTopic: PubSubTopic.NetWorthCategoryCreated,
  updateTopic: PubSubTopic.NetWorthCategoryUpdated,
  deleteTopic: PubSubTopic.NetWorthCategoryDeleted,
});
