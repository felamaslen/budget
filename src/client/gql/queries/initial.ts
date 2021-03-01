import { gql } from 'urql';

export const Initial = gql`
  query Initial($fundPeriod: FundPeriod, $fundLength: NonNegativeInt) {
    overview {
      startDate
      endDate
      annualisedFundReturns
      monthly {
        stocks
        income
        bills
        food
        general
        holiday
        social
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
        cost
      }
      olderExists
      total
    }

    bills: readList(page: bills, offset: 0, limit: 100) {
      error
      items {
        id
        date
        item
        cost
      }
      olderExists
      total
    }

    food: readListExtended(page: food, offset: 0, limit: 100) {
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

    general: readListExtended(page: general, offset: 0, limit: 100) {
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

    holiday: readListExtended(page: holiday, offset: 0, limit: 100) {
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

    social: readListExtended(page: social, offset: 0, limit: 100) {
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
