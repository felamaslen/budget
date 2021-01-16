import gql from 'graphql-tag';

export * from './analysis';
export * from './funds';
export * from './list';
export * from './net-worth';
export * from './overview';
export * from './search';
export * from './user';

export const mainSchema = gql`
  scalar Date
  scalar DateTime

  scalar NonNegativeInt
  scalar NonNegativeFloat
  scalar PositiveInt

  type CrudResponseCreate {
    error: String
    id: Int
  }

  type CrudResponseUpdate {
    error: String
  }

  type CrudResponseDelete {
    error: String
  }

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

  type Query {
    config: AppConfig
  }

  type Mutation {
    setConfig(config: AppConfigInput!): AppConfig
  }

  type Subscription {
    configUpdated: AppConfig!
  }
`;
