import gql from 'graphql-tag';

export const userSchema = gql`
  type User {
    uid: Int!
  }

  type UserInfo {
    uid: Int!
    name: String!
  }

  type LoginResponse {
    error: String
    uid: Int
    name: String
    apiKey: String
    expires: DateTime
  }
`;
