import * as controllers from '~api/controllers/list';
import {
  genericMutationResolver,
  genericAuthDbResolver,
  createFilteredSubscription,
  createSubscription,
} from '~api/modules/crud';
import { PubSubTopic } from '~api/modules/graphql/pubsub';
import type { Resolvers, SubscriptionListChangedArgs } from '~api/types';

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
    listChanged: createFilteredSubscription<'ListSubscription', SubscriptionListChangedArgs>(
      PubSubTopic.ListChanged,
      (payload, args) => args.pages.includes(payload.page),
    ),

    receiptCreated: createSubscription<'ReceiptCreated'>(PubSubTopic.ReceiptCreated),
  },
};
