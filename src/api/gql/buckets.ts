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

  type InvestmentBucket {
    expectedValue: NonNegativeInt!
    purchaseValue: NonNegativeInt!
  }

  type ListBucketsResponse {
    error: String
    buckets: [Bucket!]
    investmentBucket: InvestmentBucket
  }

  type InvestmentBucketInput {
    value: NonNegativeInt!
  }

  type SetInvestmentBucketResponse {
    expectedValue: NonNegativeInt
    error: String
  }

  extend type Query {
    listBuckets(startDate: String!, endDate: String!): ListBucketsResponse
  }

  extend type Mutation {
    upsertBucket(
      startDate: String!
      endDate: String!
      id: NonNegativeInt!
      bucket: BucketInput!
    ): UpsertBucketResponse
    setInvestmentBucket(value: NonNegativeInt!): SetInvestmentBucketResponse
  }
`;
