import { gql } from 'urql';

export const NetWorthCategoryParts = gql`
  fragment NetWorthCategoryParts on NetWorthCategory {
    type
    category
    isOption
    color
  }
`;

export const NetWorthSubcategoryParts = gql`
  fragment NetWorthSubcategoryParts on NetWorthSubcategory {
    categoryId
    subcategory
    hasCreditLimit
    appreciationRate
    isSAYE
    opacity
  }
`;

export const NetWorthEntryParts = gql`
  fragment NetWorthEntryParts on NetWorthEntry {
    date
    values {
      subcategory
      skip
      simple
      fx {
        value
        currency
      }
      option {
        units
        strikePrice
        marketPrice
        vested
      }
      loan {
        principal
        paymentsRemaining
        rate
      }
    }
    creditLimit {
      subcategory
      value
    }
    currencies {
      currency
      rate
    }
  }
`;
