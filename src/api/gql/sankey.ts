import gql from 'graphql-tag';

export const sankey = gql`
  type SankeyLink {
    from: String!
    to: String!
    weight: NonNegativeInt!
  }

  type SankeyResponse {
    links: [SankeyLink!]!
  }

  extend type Query {
    sankey: SankeyResponse
  }
`;
