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

  extend type Query {
    listBuckets(date: String!): ListBucketsResponse
  }

  extend type Mutation {
    upsertBucket(date: String!, id: NonNegativeInt!, bucket: BucketInput!): UpsertBucketResponse
  }
`;
