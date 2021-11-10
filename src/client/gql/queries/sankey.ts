import { gql } from 'urql';

export const ReadSankey = gql`
  query ReadSankey {
    sankey {
      links {
        from
        to
        weight
      }
    }
  }
`;
