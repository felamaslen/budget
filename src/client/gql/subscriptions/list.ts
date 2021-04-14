import { gql } from 'urql';

export const ListItemStandardCreated = gql`
  subscription ListItemStandardCreated {
    listItemStandardCreated: listItemCreated(
      pages: [income, bills, food, general, holiday, social]
    ) {
      page
      id
      fakeId
      item {
        date
        item
        category
        cost
        shop
      }
      overviewCost
      total
      weekly
    }
  }
`;

export const ListItemStandardUpdated = gql`
  subscription ListItemStandardUpdated {
    listItemStandardUpdated: listItemUpdated(
      pages: [income, bills, food, general, holiday, social]
    ) {
      page
      id
      item {
        date
        item
        category
        cost
        shop
      }
      overviewCost
      total
      weekly
    }
  }
`;

export const ListItemDeleted = gql`
  subscription ListItemDeleted {
    listItemDeleted {
      page
      id
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
