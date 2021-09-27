import { gql } from 'urql';

export const ListItemStandardParts = gql`
  fragment ListItemStandardParts on ListItemStandard {
    id
    date
    item
    category
    cost
    shop
  }
`;

export const IncomeParts = gql`
  fragment IncomeParts on Income {
    id
    date
    item
    category
    cost
    shop
    deductions {
      name
      value
    }
  }
`;
