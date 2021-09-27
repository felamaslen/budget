import { gql } from 'urql';

export const CreateIncome = gql`
  mutation CreateIncome($fakeId: Int!, $input: IncomeInput!) {
    createIncome(fakeId: $fakeId, input: $input) {
      error
      id
    }
  }
`;

export const UpdateIncome = gql`
  mutation UpdateIncome($id: Int!, $input: IncomeInput!) {
    updateIncome(id: $id, input: $input) {
      error
    }
  }
`;

export const DeleteIncome = gql`
  mutation DeleteIncome($id: Int!) {
    deleteIncome(id: $id) {
      error
    }
  }
`;
