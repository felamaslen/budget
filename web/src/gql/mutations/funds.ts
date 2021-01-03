import { gql } from 'urql';

export const CreateFund = gql`
  mutation CreateFund($fakeId: Int!, $input: FundInput!) {
    createFund(fakeId: $fakeId, input: $input) {
      error
      id
    }
  }
`;

export const UpdateFund = gql`
  mutation UpdateFund($id: Int!, $input: FundInput!) {
    updateFund(id: $id, input: $input) {
      error
    }
  }
`;

export const DeleteFund = gql`
  mutation DeleteFund($id: Int!) {
    deleteFund(id: $id) {
      error
    }
  }
`;

export const UpdateCashAllocationTarget = gql`
  mutation UpdateCashAllocationTarget($target: NonNegativeInt!) {
    updateCashAllocationTarget(target: $target) {
      error
    }
  }
`;

export const UpdateFundAllocationTargets = gql`
  mutation UpdateFundAllocationTargets($deltas: [TargetDelta!]!) {
    updateFundAllocationTargets(deltas: $deltas) {
      error
      deltas {
        id
        allocationTarget
      }
    }
  }
`;
