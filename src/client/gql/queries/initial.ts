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
      futureIncome
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
      nonPensionStockValue
      pensionStockValue
      stocksIncludingCash
      date
      incomeSince
      spendingSince
    }

    cashAllocationTarget

    funds: readFunds {
      items {
        ...FundParts
      }
    }

    fundHistory(period: $fundPeriod, length: $fundLength) {
      ...FundHistoryParts
    }
  }
`;
