import shortid from 'shortid';
import numericHash from 'string-hash';

import { CalculationRows } from '../types';
import { getComputedYearStartAccountValue, getRelevantYears } from './boundary';
import {
  IntermediatePredictedIncomeReduction,
  IntermediatePreviousIncomeReduction,
} from './income';
import { IntermediateTransfersReduction } from './transfers';
import type { PreviousIncomeRow } from '~api/queries/planning';

describe(getRelevantYears.name, () => {
  const previousIncomeRowBase = (): Omit<PreviousIncomeRow, 'year'> => ({
    id: numericHash(shortid.generate()),
    date: new Date(), // doesn't matter
    month: 7,
    item: 'Some item',
    gross: 100000,
    deduction_name: null,
    deduction_value: null,
  });

  describe('when there are recorded income against a year after the selected year', () => {
    it('should return only the selected year', () => {
      expect.assertions(1);
      expect(
        getRelevantYears(2018, [
          { ...previousIncomeRowBase(), year: 2020 },
          { ...previousIncomeRowBase(), year: 2020 },
          { ...previousIncomeRowBase(), year: 2022 },
        ]),
      ).toStrictEqual([2018]);
    });
  });

  describe('when there are recorded income against a year in the past', () => {
    it('should return the inclusive range from the oldest recorded entry to the selected year', () => {
      expect.assertions(1);
      expect(
        getRelevantYears(2023, [
          { ...previousIncomeRowBase(), year: 2020 },
          { ...previousIncomeRowBase(), year: 2020 },
          { ...previousIncomeRowBase(), year: 2022 },
        ]),
      ).toStrictEqual([2020, 2021, 2022, 2023]);
    });
  });
});

describe(getComputedYearStartAccountValue.name, () => {
  const accountId = 2;
  const now = new Date('2021-07-20');
  const year = 2022;
  const latestActualValues: CalculationRows['latestActualValues'] = [
    { account_id: accountId, date: new Date('2021-05-31'), value: 154420 },
  ];
  const creditCardPayments: CalculationRows['creditCardPayments'] = [];
  const valueRows: CalculationRows['valueRows'] = [];
  const previousIncomeReduction: IntermediatePreviousIncomeReduction[] = [];
  const predictedIncomeReduction: IntermediatePredictedIncomeReduction[] = [];
  const predictedCreditCardPayments: Record<number, number> = {};
  const transfersTo: IntermediateTransfersReduction[] = [];

  describe('when there is previous income', () => {
    const previousIncomeExample: IntermediatePreviousIncomeReduction[] = [
      ...previousIncomeReduction,
      {
        year: 2021,
        month: 5,
        date: new Date('2021-06-30'),
        name: 'Salary',
        value: 550000,
        deductions: [{ name: 'Tax', value: -130500 }],
      },
      {
        year: 2021,
        month: 6,
        date: new Date('2021-07-30'),
        name: 'Salary',
        value: 708333,
        deductions: [{ name: 'Tax', value: -150000 }],
      },
    ];

    it('should include the previous income in the reduction', () => {
      expect.assertions(1);

      const result = getComputedYearStartAccountValue(
        accountId,
        now,
        year,
        { latestActualValues, creditCardPayments, valueRows },
        previousIncomeExample,
        predictedIncomeReduction,
        predictedCreditCardPayments,
        transfersTo,
      );

      expect(result).toBeCloseTo(154420 + (550000 - 130500) + (708333 - 150000));
    });

    it('should ignore previous income prior to the net worth date', () => {
      expect.assertions(1);

      const result = getComputedYearStartAccountValue(
        accountId,
        now,
        year,
        { latestActualValues, creditCardPayments, valueRows },
        [
          ...previousIncomeExample,
          {
            year: 2021,
            month: 3,
            date: new Date('2021-04-30'),
            name: 'Salary',
            value: 550000,
            deductions: [{ name: 'Tax', value: -131200 }],
          },
        ],
        predictedIncomeReduction,
        predictedCreditCardPayments,
        transfersTo,
      );

      expect(result).toBeCloseTo(154420 + (550000 - 130500) + (708333 - 150000));
    });
  });

  describe('when there is predicted income', () => {
    const predictedIncomeExample: IntermediatePredictedIncomeReduction[] = [
      {
        date: new Date('2021-07-31'),
        year: 2021,
        month: 6,
        gross: 708333,
        deductions: { tax: 134028, ni: 41928, pension: 21832, studentLoan: 43288 },
      },
      {
        date: new Date('2021-08-31'),
        year: 2021,
        month: 7,
        gross: 700000,
        deductions: { tax: 124992, ni: 41901, pension: 22339, studentLoan: 43238 },
      },
    ];

    it('should include the predicted income in the reduction', () => {
      expect.assertions(1);

      const result = getComputedYearStartAccountValue(
        accountId,
        now,
        year,
        { latestActualValues, creditCardPayments, valueRows },
        previousIncomeReduction,
        predictedIncomeExample,
        predictedCreditCardPayments,
        transfersTo,
      );

      expect(result).toBeCloseTo(
        154420 +
          (708333 - (134028 + 41928 + 21832 + 43288)) +
          (700000 - (124992 + 41901 + 22339 + 43238)),
      );
    });
  });

  describe('when there are explicit values', () => {
    const valueRowsExample: CalculationRows['valueRows'] = [
      {
        id: accountId,
        value_name: 'An old payment which should be ignored',
        value_id: 200,
        value_year: 2021,
        value_month: 3,
        value_value: -16650,
        value_formula: null,
        value_transfer_to: null,
      },
      {
        id: accountId,
        value_name:
          'A payment which happened in the same month as the latest net worth value and should also be ignored',
        value_id: 201,
        value_year: 2021,
        value_month: 4,
        value_value: -88213,
        value_formula: null,
        value_transfer_to: null,
      },
      {
        id: accountId,
        value_name: 'A payment which happened since the net worth date and should be included',
        value_id: 201,
        value_year: 2021,
        value_month: 5,
        value_value: -142203,
        value_formula: null,
        value_transfer_to: null,
      },
      {
        id: accountId + 1,
        value_name: 'A payment on a different account which should be ignored',
        value_id: 202,
        value_year: 2021,
        value_month: 5,
        value_value: -8449,
        value_formula: null,
        value_transfer_to: null,
      },
      {
        id: accountId,
        value_name: 'A payment which happened during the current year and should be ignored',
        value_id: 203,
        value_year: 2022,
        value_month: 3,
        value_value: -1024,
        value_formula: null,
        value_transfer_to: null,
      },
    ];

    it('should include those values which occured between the net worth date and the current year', () => {
      expect.assertions(1);

      const result = getComputedYearStartAccountValue(
        accountId,
        now,
        year,
        { latestActualValues, creditCardPayments, valueRows: valueRowsExample },
        previousIncomeReduction,
        predictedIncomeReduction,
        predictedCreditCardPayments,
        transfersTo,
      );

      expect(result).toBeCloseTo(154420 - 142203);
    });
  });
});
