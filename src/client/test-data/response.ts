import getUnixTime from 'date-fns/getUnixTime';

import { PageNonStandard, PageListStandard } from '~client/types/enum';
import { InitialQuery } from '~client/types/gql';

export const testResponse: InitialQuery = {
  overview: {
    startDate: '2018-10-31T23:59:59.999Z',
    endDate: '2020-04-30T23:59:59.999+0100',
    monthly: {
      investmentPurchases: [],
      [PageListStandard.Income]: [],
      [PageListStandard.Bills]: [],
      [PageListStandard.Food]: [],
      [PageListStandard.General]: [],
      [PageListStandard.Holiday]: [],
      [PageListStandard.Social]: [],
    },
    initialCumulativeValues: {
      income: 123,
      spending: 456,
    },
  },

  netWorthCategories: [],
  netWorthSubcategories: [],
  netWorthEntries: {
    current: [],
  },

  [PageNonStandard.Funds]: { items: [] },

  cashAllocationTarget: 20000,

  fundHistory: {
    startTime: getUnixTime(new Date('2017-02-03')),
    cacheTimes: [],
    prices: [],
    overviewCost: [],
    annualisedFundReturns: 0.173,
  },
};
