import { CalculationRows } from '../../types';

export const rateRows = (year = 2022): CalculationRows['rateRows'] => [
  { id: 1, uid: 1, year, name: 'IncomeTaxBasicRate', value: 0.2 },
  { id: 2, uid: 1, year, name: 'IncomeTaxHigherRate', value: 0.4 },
  { id: 3, uid: 1, year, name: 'IncomeTaxAdditionalRate', value: 0.45 },
  { id: 4, uid: 1, year, name: 'NILowerRate', value: 0.12 },
  { id: 5, uid: 1, year, name: 'NIHigherRate', value: 0.02 },
];

export const thresholdRows = (year = 2022): CalculationRows['thresholdRows'] => [
  { id: 1, uid: 1, year, name: 'IncomeTaxBasicThreshold', value: 3750000 },
  { id: 2, uid: 1, year, name: 'IncomeTaxAdditionalThreshold', value: 15000000 },
  { id: 3, uid: 1, year, name: 'NIPT', value: 79700 },
  { id: 4, uid: 1, year, name: 'NIUEL', value: 418900 },
];
