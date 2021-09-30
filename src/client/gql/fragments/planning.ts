import { gql } from 'urql';

export const PlanningParametersParts = gql`
  fragment PlanningParametersParts on PlanningParameters {
    year
    rates {
      name
      value
    }
    thresholds {
      name
      value
    }
  }
`;

export const PlanningAccountParts = gql`
  fragment PlanningAccountParts on PlanningAccount {
    id
    account
    netWorthSubcategoryId
    income {
      id
      startDate
      endDate
      salary
      taxCode
      pensionContrib
      studentLoan
    }
    pastIncome {
      date
      gross
      deductions {
        name
        value
      }
    }
    creditCards {
      id
      netWorthSubcategoryId
      payments {
        id
        year
        month
        value
      }
    }
    values {
      id
      year
      month
      transferToAccountId
      name
      value
      formula
    }
  }
`;
