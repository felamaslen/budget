import gql from 'graphql-tag';

export const analysisSchema = gql`
  enum AnalysisPage {
    bills
    food
    general
    holiday
    social
  }

  enum AnalysisPeriod {
    year
    month
    week
  }

  enum AnalysisGroupBy {
    category
    shop
  }

  type CategoryTreeItem {
    category: String!
    sum: Int!
  }

  type CategoryCostTree {
    item: AnalysisPage!
    tree: [CategoryTreeItem!]!
  }

  type CategoryCostTreeDeep {
    item: String!
    tree: [CategoryTreeItem!]!
  }

  type AnalysisResponse {
    cost: [CategoryCostTree!]!
    description: String!
    startDate: Date!
    endDate: Date!
    saved: Int!
    timeline: [[Int!]!]
  }

  extend type Query {
    analysis(period: AnalysisPeriod!, groupBy: AnalysisGroupBy!, page: Int): AnalysisResponse

    analysisDeep(
      category: AnalysisPage!
      period: AnalysisPeriod!
      groupBy: AnalysisGroupBy!
      page: Int
    ): [CategoryCostTreeDeep!]
  }
`;
