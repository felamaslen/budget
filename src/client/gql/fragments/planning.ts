import { gql } from 'urql';

export const PlanningParametersParts = gql`
  fragment PlanningParametersParts on PlanningParameters {
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
    upperLimit
    lowerLimit
    income {
      id
      startDate
      endDate
      salary
      taxCode
      pensionContrib
      studentLoan
    }
    creditCards {
      id
      netWorthSubcategoryId
      payments {
        id
        month
        value
      }
      predictedPayment
    }
    values {
      id
      month
      transferToAccountId
      name
      value
      formula
    }
    computedValues {
      key
      month
      name
      value
      isVerified
      isTransfer
    }
    computedStartValue
    includeBills
  }
`;
