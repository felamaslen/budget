import gql from 'graphql-tag';

export const configSchema = gql`
  type AppConfig {
    birthDate: Date!
    pieTolerance: Float!
    futureMonths: Int!
  }

  extend type Query {
    config: AppConfig
  }
`;
