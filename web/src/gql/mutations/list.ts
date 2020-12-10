import gql from 'graphql-tag';

export const CreateListItem = gql`
  mutation CreateListItem($page: PageListStandard!, $fakeId: Int!, $input: ListItemStandardInput!) {
    createListItem(page: $page, fakeId: $fakeId, input: $input) {
      error
      id
    }
  }
`;

export const UpdateListItem = gql`
  mutation UpdateListItem($page: PageListStandard!, $id: Int!, $input: ListItemStandardInput!) {
    updateListItem(page: $page, id: $id, input: $input) {
      error
    }
  }
`;

export const DeleteListItem = gql`
  mutation DeleteListItem($page: PageListStandard!, $id: Int!) {
    deleteListItem(page: $page, id: $id) {
      error
    }
  }
`;

export const CreateReceipt = gql`
  mutation CreateReceipt($date: Date!, $shop: String!, $items: [ReceiptInput!]!) {
    createReceipt(date: $date, shop: $shop, items: $items) {
      error
    }
  }
`;
