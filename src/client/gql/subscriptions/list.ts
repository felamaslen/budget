import { gql } from 'urql';

export const IncomeChanged = gql`
  subscription IncomeChanged {
    incomeChanged {
      created {
        fakeId
        item {
          ...IncomeParts
        }
      }
      updated {
        ...IncomeParts
      }
      deleted

      overviewCost
      weekly
      total
      totalDeductions {
        name
        value
      }
    }
  }
`;

export const ListChanged = gql`
  subscription ListChanged {
    listChanged(pages: [bills, food, general, holiday, social]) {
      page
      created {
        fakeId
        item {
          ...ListItemStandardParts
        }
      }
      updated {
        ...ListItemStandardParts
      }
      deleted

      overviewCost
      total
      weekly
    }
  }
`;

export const ReceiptCreated = gql`
  subscription ReceiptCreated {
    receiptCreated {
      items {
        page
        id
        date
        item
        cost
        category
        shop
      }
    }
  }
`;
