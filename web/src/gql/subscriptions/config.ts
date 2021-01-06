import { gql } from 'urql';

export const ConfigUpdated = gql`
  subscription ConfigUpdated {
    configUpdated {
      birthDate
      fundPeriod
      fundLength
    }
  }
`;
