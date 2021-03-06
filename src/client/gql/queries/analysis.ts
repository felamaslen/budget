import { gql } from 'urql';

export const Analysis = gql`
  query Analysis($period: AnalysisPeriod!, $groupBy: AnalysisGroupBy!, $page: Int) {
    analysis(period: $period, groupBy: $groupBy, page: $page) {
      description
      startDate
      endDate
      cost {
        item
        tree {
          category
          sum
        }
      }
    }
  }
`;

export const AnalysisDeep = gql`
  query AnalysisDeep(
    $category: AnalysisPage!
    $period: AnalysisPeriod!
    $groupBy: AnalysisGroupBy!
    $page: Int
  ) {
    analysisDeep(category: $category, period: $period, groupBy: $groupBy, page: $page) {
      item
      tree {
        category
        sum
      }
    }
  }
`;
