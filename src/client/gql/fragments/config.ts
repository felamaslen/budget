import { gql } from 'urql';

export const ConfigParts = gql`
  fragment ConfigParts on AppConfig {
    birthDate
    futureMonths
    realTimePrices
    fundMode
    fundPeriod
    fundLength
  }
`;
