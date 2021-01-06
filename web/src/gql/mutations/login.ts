import { gql } from 'urql';

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

export const logout = gql`
  mutation Logout {
    logout {
      error
      ok
    }
  }
`;
