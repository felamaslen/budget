import {
  createFund,
  deleteFund,
  readCashTarget,
  readFundHistory,
  readFunds,
  updateCashTarget,
  updateFund,
  updateFundAllocationTargets,
} from '~api/controllers/funds';
import { getStockPrices } from '~api/controllers/stocks';
import {
  genericAuthDbResolver,
  genericMutationResolver,
  createSubscription,
} from '~api/modules/crud';
import { withSlonik } from '~api/modules/db';
import { pubsub, PubSubTopic } from '~api/modules/graphql/pubsub';
import { SubscriptionFundPricesUpdatedArgs, Resolvers } from '~api/types';
import { Context } from '~api/types/resolver';

export const fundsResolvers: Resolvers = {
  Query: {
    readFunds: genericAuthDbResolver(readFunds),

    cashAllocationTarget: genericAuthDbResolver(readCashTarget),
    fundHistory: genericAuthDbResolver(readFundHistory),

    stockPrices: genericAuthDbResolver(getStockPrices),
  },

  Mutation: {
    createFund: genericMutationResolver(createFund),
    updateFund: genericMutationResolver(updateFund),
    deleteFund: genericMutationResolver(deleteFund),

    updateCashAllocationTarget: genericMutationResolver(updateCashTarget),
    updateFundAllocationTargets: genericMutationResolver(updateFundAllocationTargets),
  },

  Subscription: {
    fundCreated: createSubscription<'FundCreateUpdate'>(PubSubTopic.FundCreated),
    fundUpdated: createSubscription<'FundCreateUpdate'>(PubSubTopic.FundUpdated),
    fundDeleted: createSubscription<'FundDelete'>(PubSubTopic.FundDeleted),

    fundPricesUpdated: {
      subscribe: (): AsyncIterator<void> => pubsub.asyncIterator(PubSubTopic.FundPricesUpdated),
      resolve: withSlonik(
        async (db, _: unknown, args: SubscriptionFundPricesUpdatedArgs, context: Context) => {
          if (!context.user?.uid) {
            return null;
          }
          return readFundHistory(db, context.user.uid, args);
        },
      ),
    },

    cashAllocationTargetUpdated: createSubscription<'NonNegativeInt'>(
      PubSubTopic.CashAllocationTargetUpdated,
    ),
    fundAllocationTargetsUpdated: createSubscription<'UpdatedFundAllocationTargets'>(
      PubSubTopic.FundAllocationTargetsUpdated,
    ),
  },
};
