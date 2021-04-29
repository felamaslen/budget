import { getExchangeRates } from '~api/controllers/exchange-rates';
import { genericAuthDbResolver } from '~api/modules/crud';
import type { Resolvers } from '~api/types';

export const exchangeRateResolvers: Resolvers = {
  Query: {
    exchangeRates: genericAuthDbResolver(getExchangeRates),
  },
};
