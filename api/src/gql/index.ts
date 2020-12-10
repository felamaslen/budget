import gql from 'graphql-tag';

export * from './analysis';
export * from './config';
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

  type Heartbeat {
    uid: Int
    timestamp: Int!
  }

  type Query {
    whoami: UserInfo
  }

  type Mutation {
    login(pin: Int!): LoginResponse!
  }

  type Subscription {
    heartbeat: Heartbeat!
  }
`;
