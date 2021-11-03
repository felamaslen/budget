import numericHash from 'string-hash';

import type { State } from '../types';
import { StandardRates, StandardThresholds } from '~shared/planning';

export const testState: State = {
  year: 2020,
  parameters: {
    rates: [
      { name: StandardRates.IncomeTaxBasicRate, value: 0.2 },
      { name: StandardRates.IncomeTaxHigherRate, value: 0.4 },
      { name: StandardRates.IncomeTaxAdditionalRate, value: 0.45 },
      { name: StandardRates.NILowerRate, value: 0.12 },
      { name: StandardRates.NIHigherRate, value: 0.02 },
      { name: StandardRates.StudentLoanRate, value: 0.09 },
    ],
    thresholds: [
      { name: StandardThresholds.IncomeTaxBasicAllowance, value: 3750000 },
      { name: StandardThresholds.IncomeTaxAdditionalThreshold, value: 15000000 },
      { name: StandardThresholds.NIPT, value: 79700 },
      { name: StandardThresholds.NIUEL, value: 418900 },
      { name: StandardThresholds.StudentLoanThreshold, value: 2729500 },
    ],
  },
  accounts: [
    {
      id: numericHash('account-savings'),
      account: 'Savings',
      netWorthSubcategoryId: numericHash('real-locked-cash-subcategory-id'),
      values: [],
      income: [],
      creditCards: [],
      computedValues: [
        {
          key: 'transfer-2020-9-savings',
          month: 9,
          name: 'Checking transfer',
          value: 120500,
          isVerified: false,
          isTransfer: true,
        },
      ],
      computedStartValue: 966720,
    },
    {
      id: numericHash('account-checking'),
      account: 'Checking',
      netWorthSubcategoryId: numericHash('real-bank-subcategory-id'),
      values: [
        {
          id: numericHash('value-0'),
          month: 9,
          name: 'Transfer to savings',
          value: -120500,
          transferToAccountId: numericHash('account-savings'),
        },
        {
          id: numericHash('value-1'),
          month: 1,
          name: 'Car payment',
          value: -56293,
        },
        {
          id: numericHash('value-2'),
          month: 3,
          name: 'Transfer to savings',
          value: -150000,
          transferToAccountId: numericHash('account-savings'),
        },
        {
          id: numericHash('value-3'),
          month: 7,
          name: 'Pension (SIPP)',
          value: -50000,
        },
        {
          id: numericHash('value-4'),
          month: 7,
          name: 'My zero value',
          value: 0,
        },
        {
          id: numericHash('value-5'),
          month: 8,
          name: 'My recurring payment',
          value: -15623,
        },
        {
          id: numericHash('value-6'),
          month: 9,
          name: 'My recurring payment',
          value: -27310,
        },
        {
          id: numericHash('value-7'),
          month: 11,
          name: 'My recurring payment',
          value: -10032,
        },
      ],
      income: [
        {
          salary: 8500000,
          taxCode: '818L',
          startDate: '2020-08-11',
          endDate: '2022-03-31',
          pensionContrib: 0.03,
          studentLoan: true,
        },
      ],
      creditCards: [
        {
          netWorthSubcategoryId: numericHash('real-credit-card-subcategory-id'),
          payments: [
            { id: numericHash('credit-card-payment-01'), month: 5, value: -15628 },
            { id: numericHash('credit-card-payment-02'), month: 7, value: -14892 },
            { id: numericHash('credit-card-payment-03'), month: 8, value: -39923 },
          ],
          predictedPayment: -20156,
        },
      ],
      computedValues: [
        {
          key: `salary-2020-07-30`,
          month: 6,
          name: 'Salary',
          value: 500000,
          isVerified: true,
          isTransfer: false,
        },
        {
          key: `investments-2020-07-31`,
          month: 6,
          name: 'Investments',
          value: -333300,
          isVerified: true,
          isTransfer: false,
        },
        {
          key: `salary-2020-09-30`,
          month: 8,
          name: 'Salary',
          value: 550000,
          isVerified: true,
          isTransfer: false,
        },
        {
          key: `deduction-2020-09-30-Tax`,
          month: 8,
          name: 'Income tax',
          value: -105603,
          isVerified: true,
          isTransfer: false,
        },
        {
          key: `salary-2020-12-predicted`,
          month: 11,
          name: 'Salary',
          value: 708333,
          isVerified: false,
          isTransfer: false,
        },
        {
          key: `pension-2020-1-predicted`,
          month: 1,
          name: 'Pension (SIPP)',
          value: -300000,
          isVerified: false,
          isTransfer: false,
        },
      ],
      computedStartValue: 195562,
    },
  ],
  taxReliefFromPreviousYear: 48872,
};
