import gql from 'graphql-tag';
import * as Urql from 'urql';
export type Maybe<T> = T | null;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type Omit<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>;
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: string;
  String: string;
  Boolean: boolean;
  Int: number;
  Float: number;
  DateTime: any;
};


export type Query = {
  __typename?: 'Query';
  whoami?: Maybe<UserInfo>;
};

export type Mutation = {
  __typename?: 'Mutation';
  login: LoginResponse;
};


export type MutationLoginArgs = {
  pin: Scalars['Int'];
};

export type User = {
  __typename?: 'User';
  uid: Scalars['Int'];
};

export type UserInfo = {
  __typename?: 'UserInfo';
  uid: Scalars['Int'];
  name: Scalars['String'];
};

export type LoginResponse = {
  __typename?: 'LoginResponse';
  error?: Maybe<Scalars['String']>;
  uid?: Maybe<Scalars['Int']>;
  name?: Maybe<Scalars['String']>;
  apiKey?: Maybe<Scalars['String']>;
  expires?: Maybe<Scalars['DateTime']>;
};

export type LoginMutationVariables = Exact<{
  pin: Scalars['Int'];
}>;


export type LoginMutation = (
  { __typename?: 'Mutation' }
  & { login: (
    { __typename?: 'LoginResponse' }
    & Pick<LoginResponse, 'error' | 'uid' | 'name' | 'apiKey' | 'expires'>
  ) }
);


export const LoginDocument = gql`
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

export function useLoginMutation() {
  return Urql.useMutation<LoginMutation, LoginMutationVariables>(LoginDocument);
};