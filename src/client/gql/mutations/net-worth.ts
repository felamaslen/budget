import { gql } from 'urql';

export const CreateNetWorthCategory = gql`
  mutation CreateNetWorthCategory($input: NetWorthCategoryInput!) {
    createNetWorthCategory(input: $input) {
      id
      error
    }
  }
`;

export const UpdateNetWorthCategory = gql`
  mutation UpdateNetWorthCategory($id: Int!, $input: NetWorthCategoryInput!) {
    updateNetWorthCategory(id: $id, input: $input) {
      error
    }
  }
`;

export const DeleteNetWorthCategory = gql`
  mutation DeleteNetWorthCategory($id: Int!) {
    deleteNetWorthCategory(id: $id) {
      error
    }
  }
`;

export const CreateNetWorthSubcategory = gql`
  mutation CreateNetWorthSubcategory($input: NetWorthSubcategoryInput!) {
    createNetWorthSubcategory(input: $input) {
      id
      error
    }
  }
`;

export const UpdateNetWorthSubcategory = gql`
  mutation UpdateNetWorthSubcategory($id: Int!, $input: NetWorthSubcategoryInput!) {
    updateNetWorthSubcategory(id: $id, input: $input) {
      error
    }
  }
`;

export const DeleteNetWorthSubcategory = gql`
  mutation DeleteNetWorthSubcategory($id: Int!) {
    deleteNetWorthSubcategory(id: $id) {
      error
    }
  }
`;

export const CreateNetWorthEntry = gql`
  mutation CreateNetWorthEntry($input: NetWorthEntryInput!) {
    createNetWorthEntry(input: $input) {
      id
      error
    }
  }
`;

export const UpdateNetWorthEntry = gql`
  mutation UpdateNetWorthEntry($id: Int!, $input: NetWorthEntryInput!) {
    updateNetWorthEntry(id: $id, input: $input) {
      error
    }
  }
`;

export const DeleteNetWorthEntry = gql`
  mutation DeleteNetWorthEntry($id: Int!) {
    deleteNetWorthEntry(id: $id) {
      error
    }
  }
`;
