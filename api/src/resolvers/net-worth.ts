import {
  netWorthCategory,
  netWorthSubcategory,
  createNetWorthEntry,
  readNetWorthEntries,
  updateNetWorthEntry,
  deleteNetWorthEntry,
} from '~api/controllers';
import {
  genericMutationResolver,
  createResolver,
  readResolver,
  updateResolver,
  deleteResolver,
  genericAuthDbResolver,
  createSubscription,
} from '~api/modules/crud';
import { PubSubTopic } from '~api/modules/graphql/pubsub';
import { Resolvers } from '~api/types';

export const netWorthResolvers: Resolvers = {
  Query: {
    readNetWorthCategories: readResolver(netWorthCategory),
    readNetWorthSubcategories: readResolver(netWorthSubcategory),

    readNetWorthEntries: genericAuthDbResolver(readNetWorthEntries),
  },

  Mutation: {
    createNetWorthCategory: createResolver(netWorthCategory),
    updateNetWorthCategory: updateResolver(netWorthCategory),
    deleteNetWorthCategory: deleteResolver(netWorthCategory),

    createNetWorthSubcategory: createResolver(netWorthSubcategory),
    updateNetWorthSubcategory: updateResolver(netWorthSubcategory),
    deleteNetWorthSubcategory: deleteResolver(netWorthSubcategory),

    createNetWorthEntry: genericMutationResolver(createNetWorthEntry),
    updateNetWorthEntry: genericMutationResolver(updateNetWorthEntry),
    deleteNetWorthEntry: genericMutationResolver(deleteNetWorthEntry),
  },

  Subscription: {
    netWorthCategoryCreated: createSubscription<'NetWorthCategoryCreated'>(
      PubSubTopic.NetWorthCategoryCreated,
    ),
    netWorthCategoryUpdated: createSubscription<'NetWorthCategoryUpdated'>(
      PubSubTopic.NetWorthCategoryUpdated,
    ),
    netWorthCategoryDeleted: createSubscription<'NetWorthDeleted'>(
      PubSubTopic.NetWorthCategoryDeleted,
    ),
    netWorthSubcategoryCreated: createSubscription<'NetWorthSubcategoryCreated'>(
      PubSubTopic.NetWorthSubcategoryCreated,
    ),
    netWorthSubcategoryUpdated: createSubscription<'NetWorthSubcategoryUpdated'>(
      PubSubTopic.NetWorthSubcategoryUpdated,
    ),
    netWorthSubcategoryDeleted: createSubscription<'NetWorthDeleted'>(
      PubSubTopic.NetWorthSubcategoryDeleted,
    ),
    netWorthEntryCreated: createSubscription<'NetWorthEntryCreated'>(
      PubSubTopic.NetWorthEntryCreated,
    ),
    netWorthEntryUpdated: createSubscription<'NetWorthEntryUpdated'>(
      PubSubTopic.NetWorthEntryUpdated,
    ),
    netWorthEntryDeleted: createSubscription<'NetWorthDeleted'>(PubSubTopic.NetWorthEntryDeleted),
  },
};
