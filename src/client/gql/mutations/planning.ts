import { gql } from 'urql';

export const SyncPlanning = gql`
  mutation SyncPlanning($input: PlanningSync) {
    syncPlanning(input: $input) {
      error
      parameters {
        ...PlanningParametersParts
      }
      accounts {
        ...PlanningAccountParts
      }
    }
  }
`;
