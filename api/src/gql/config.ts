import gql from 'graphql-tag';

export const configSchema = gql`
  type AppConfig {
    birthDate: String!
    pieTolerance: Float!
    futureMonths: Int!
    fundPeriod: FundPeriod
    fundLength: NonNegativeInt
  }

  input AppConfigInput {
    birthDate: Date
    pieTolerance: Float
    futureMonths: Int
    fundPeriod: FundPeriod
    fundLength: NonNegativeInt
  }

  extend type Query {
    config: AppConfig
  }

  extend type Mutation {
    setConfig(config: AppConfigInput!): AppConfig
  }

  extend type Subscription {
    configUpdated: AppConfig!
  }
`;
