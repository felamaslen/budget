import { gql } from 'urql';

export const ConfigUpdated = gql`
  subscription ConfigUpdated {
    configUpdated {
      ...ConfigParts
    }
  }
`;
