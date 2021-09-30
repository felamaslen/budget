import { gql } from 'urql';

export const ReadPlanning = gql`
  query ReadPlanning {
    readPlanningParameters {
      parameters {
        ...PlanningParametersParts
      }
    }
    readPlanningAccounts {
      accounts {
        ...PlanningAccountParts
      }
    }
  }
`;
