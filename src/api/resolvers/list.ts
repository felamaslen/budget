import * as controllers from '~api/controllers/list';
import {
  genericMutationResolver,
  genericAuthDbResolver,
  createFilteredSubscription,
  createSubscription,
} from '~api/modules/crud';
import { PubSubTopic } from '~api/modules/graphql/pubsub';
import {
  Resolvers,
  SubscriptionListItemCreatedArgs,
  SubscriptionListItemUpdatedArgs,
} from '~api/types';

export const listResolvers: Resolvers = {
  Query: {
    readList: genericAuthDbResolver(controllers.readList),
  },

  Mutation: {
    createListItem: genericMutationResolver(controllers.createList),
    updateListItem: genericMutationResolver(controllers.updateList),
    deleteListItem: genericMutationResolver(controllers.deleteList),

    createReceipt: genericMutationResolver(controllers.createReceipt),
  },

  Subscription: {
    listItemCreated: createFilteredSubscription<
      'ListItemCreateUpdate',
      SubscriptionListItemCreatedArgs
    >(PubSubTopic.ListItemCreated, (payload, args) => args.pages.includes(payload.page)),

    receiptCreated: createSubscription<'ReceiptCreated'>(PubSubTopic.ReceiptCreated),

    listItemUpdated: createFilteredSubscription<
      'ListItemCreateUpdate',
      SubscriptionListItemUpdatedArgs
    >(PubSubTopic.ListItemUpdated, (payload, args) => args.pages.includes(payload.page)),

    listItemDeleted: createSubscription<'ListItemDelete'>(PubSubTopic.ListItemDeleted),
  },
};
