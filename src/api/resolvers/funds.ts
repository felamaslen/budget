import {
  createFund,
  deleteFund,
  readCashTarget,
  readFundHistory,
  readFundHistoryCandlestick,
  readFundHistoryIndividual,
  readFunds,
  updateCashTarget,
  updateFund,
  updateFundAllocationTargets,
} from '~api/controllers/funds';
import { getStockPrices, getStockValue } from '~api/controllers/stocks';
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
    fundHistoryCandlestick: genericAuthDbResolver(readFundHistoryCandlestick),
    fundHistoryIndividual: genericAuthDbResolver(readFundHistoryIndividual),

    stockPrices: genericAuthDbResolver(getStockPrices),
    stockValue: genericAuthDbResolver(getStockValue),
  },

  Mutation: {
    createFund: genericMutationResolver(createFund),
    updateFund: genericMutationResolver(updateFund),
    deleteFund: genericMutationResolver(deleteFund),

    updateCashAllocationTarget: genericMutationResolver(updateCashTarget),
    updateFundAllocationTargets: genericMutationResolver(updateFundAllocationTargets),
  },

  Subscription: {
    fundsChanged: createSubscription<'FundSubscription'>(PubSubTopic.FundsChanged),

    fundPricesUpdated: {
      subscribe: (): AsyncIterator<void> => pubsub.asyncIterator(PubSubTopic.FundPricesUpdated),
      resolve: withSlonik(
        async (db, _: unknown, args: SubscriptionFundPricesUpdatedArgs, context: Context) =>
          context.user?.uid ? readFundHistory(db, context.user.uid, args) : null,
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
