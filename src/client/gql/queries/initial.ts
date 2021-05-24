import { gql } from 'urql';

export const Initial = gql`
  query Initial($fundPeriod: FundPeriod, $fundLength: NonNegativeInt) {
    config {
      ...ConfigParts
    }

    overview {
      startDate
      endDate
      monthly {
        investmentPurchases
        income
        bills
        food
        general
        holiday
        social
      }
      initialCumulativeValues {
        income
        spending
      }
    }

    netWorthCategories: readNetWorthCategories {
      id
      ...NetWorthCategoryParts
    }
    netWorthSubcategories: readNetWorthSubcategories {
      id
      ...NetWorthSubcategoryParts
    }

    netWorthEntries: readNetWorthEntries {
      current {
        id
        ...NetWorthEntryParts
      }
    }

    netWorthCashTotal {
      cashInBank
      stockValue
      stocksIncludingCash
      date
    }

    cashAllocationTarget

    funds: readFunds {
      items {
        id
        item
        allocationTarget
        transactions {
          date
          units
          price
          fees
          taxes
          drip
        }
        stockSplits {
          date
          ratio
        }
      }
    }

    fundHistory(period: $fundPeriod, length: $fundLength) {
      ...FundHistoryParts
    }
  }
`;
