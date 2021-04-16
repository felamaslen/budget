import { gql } from 'urql';

export const ConfigUpdated = gql`
  subscription ConfigUpdated {
    configUpdated {
      birthDate
      realTimePrices
      fundMode
      fundPeriod
      fundLength
    }
  }
`;
