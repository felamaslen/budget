import { gql } from 'urql';

export const GetConfig = gql`
  query Config {
    config {
      ...ConfigParts
    }
  }
`;
