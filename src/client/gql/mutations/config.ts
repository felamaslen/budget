import { gql } from 'urql';

export const setConfig = gql`
  mutation SetConfig($config: AppConfigInput!) {
    setConfig(config: $config) {
      birthDate
      futureMonths
      realTimePrices
      fundMode
      fundPeriod
      fundLength
    }
  }
`;
