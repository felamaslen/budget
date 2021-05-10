import gql from 'graphql-tag';

export const bucketsSchema = gql`
  type Bucket {
    id: NonNegativeInt!
    page: AnalysisPage!
    filterCategory: String
    expectedValue: NonNegativeInt!
    actualValue: NonNegativeInt!
  }

  input BucketInput {
    page: AnalysisPage!
    filterCategory: String
    value: NonNegativeInt!
  }

  type UpsertBucketResponse {
    buckets: [Bucket!]
    error: String
  }

  type ListBucketsResponse {
    buckets: [Bucket!]
    error: String
  }

  type InvestmentBucket {
    value: NonNegativeInt!
  }

  type InvestmentBucketInput {
    value: NonNegativeInt!
  }

  type SetInvestmentBucketResponse {
    bucket: InvestmentBucket
    error: String
  }

  extend type Query {
    listBuckets(date: String!): ListBucketsResponse
    getInvestmentBucket: InvestmentBucket
  }

  extend type Mutation {
    upsertBucket(date: String!, id: NonNegativeInt!, bucket: BucketInput!): UpsertBucketResponse
    setInvestmentBucket(value: NonNegativeInt!): SetInvestmentBucketResponse
  }
`;
