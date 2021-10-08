import { gql } from 'urql';

export const SyncPlanning = gql`
  mutation SyncPlanning($year: NonNegativeInt!, $input: PlanningSync) {
    syncPlanning(year: $year, input: $input) {
      error
      year
      parameters {
        ...PlanningParametersParts
      }
      accounts {
        ...PlanningAccountParts
      }
      taxReliefFromPreviousYear
    }
  }
`;
