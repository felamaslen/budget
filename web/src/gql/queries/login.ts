import gql from 'graphql-tag';

export const Login = gql`
  mutation Login($pin: Int!) {
    login(pin: $pin) {
      error
      uid
      name
      apiKey
      expires
    }
  }
`;
