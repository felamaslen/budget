import { gql } from 'urql';

export const netWorthLoans = gql`
  query NetWorthLoans {
    netWorthLoans {
      loans {
        subcategory
        values {
          date
          value {
            principal
            rate
            paymentsRemaining
            paid
          }
        }
      }
    }
  }
`;
