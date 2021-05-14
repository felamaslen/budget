import { gql } from 'urql';

export const Initial = gql`
  query Initial($fundPeriod: FundPeriod, $fundLength: NonNegativeInt) {
    config {
      ...ConfigParts
    }

    overview {
      startDate
      endDate
      annualisedFundReturns
      monthly {
        stocks
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

    income: readList(page: income, offset: 0, limit: 100) {
      error
      items {
        id
        date
        item
        category
        cost
        shop
      }
      olderExists
      total
      weekly
    }

    bills: readList(page: bills, offset: 0, limit: 100) {
      error
      items {
        id
        date
        item
        category
        cost
        shop
      }
      olderExists
      total
      weekly
    }

    food: readList(page: food, offset: 0, limit: 100) {
      error
      items {
        id
        date
        item
        category
        cost
        shop
      }
      olderExists
      total
      weekly
    }

    general: readList(page: general, offset: 0, limit: 100) {
      error
      items {
        id
        date
        item
        category
        cost
        shop
      }
      olderExists
      total
      weekly
    }

    holiday: readList(page: holiday, offset: 0, limit: 100) {
      error
      items {
        id
        date
        item
        category
        cost
        shop
      }
      olderExists
      total
      weekly
    }

    social: readList(page: social, offset: 0, limit: 100) {
      error
      items {
        id
        date
        item
        category
        cost
        shop
      }
      olderExists
      total
      weekly
    }
  }
`;
