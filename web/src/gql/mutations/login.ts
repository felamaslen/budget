import gql from 'graphql-tag';

export const login = gql`
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
