import * as controllers from '~api/controllers/income';
import {
  genericMutationResolver,
  createSubscription,
  genericAuthDbResolver,
} from '~api/modules/crud';
import { PubSubTopic } from '~api/modules/graphql/pubsub';
import { Resolvers } from '~api/types';

export const incomeResolvers: Resolvers = {
  Query: {
    readIncome: genericAuthDbResolver(controllers.readIncome),
  },

  Mutation: {
    createIncome: genericMutationResolver(controllers.createIncome),
    updateIncome: genericMutationResolver(controllers.updateIncome),
    deleteIncome: genericMutationResolver(controllers.deleteIncome),
  },

  Subscription: {
    incomeChanged: createSubscription<'IncomeSubscription'>(PubSubTopic.IncomeChanged),
  },
};
