import numericHash from 'string-hash';

import { CalculationRows } from '../types';
import { getComputedYearStartAccountValue, getPredictFromDate, getRelevantYears } from './boundary';
import {
  IntermediatePredictedIncomeReduction,
  IntermediatePreviousIncomeReduction,
} from './income';
import { IntermediateTransfersReduction } from './transfers';
import type { LatestPlanningAccountValueRow, PreviousIncomeRow } from '~api/queries/planning';

describe(getPredictFromDate.name, () => {
  const now = new Date('2021-06-28T11:39:20+0100');

  describe('when there is no recorded net worth value', () => {
    it('should return the start of the current month', () => {
      expect.assertions(1);
      expect(getPredictFromDate(now, { latestActualValues: [] })).toStrictEqual(
        new Date('2021-06-01T00:00:00.000Z'),
      );
    });
  });

  describe('when there is a recorded net worth value', () => {
    describe('when the latest recorded net worth value is in the past', () => {
      it('should return the start of the month following the latest recorded value', () => {
        expect.assertions(1);
        expect(
          getPredictFromDate(now, {
            latestActualValues: [
              {
                date: new Date('2021-02-26'),
              } as LatestPlanningAccountValueRow,
            ],
          }),
        ).toStrictEqual(new Date('2021-03-01T00:00:00.000Z'));
      });
    });

    describe.each`
      case              | date
      ${'before today'} | ${new Date('2021-06-14')}
      ${'after today'}  | ${new Date('2021-06-29')}
    `('when the latest recorded net worth value is $case in the current month', ({ date }) => {
      it('should return the start of the following month', () => {
        expect.assertions(1);
        expect(
          getPredictFromDate(now, {
            latestActualValues: [
              {
                date,
              } as LatestPlanningAccountValueRow,
            ],
          }),
        ).toStrictEqual(new Date('2021-07-01T00:00:00.000Z'));
      });
    });

    describe('when the latest recorded net worth value is in the future', () => {
      it('should return the start of the month following the net worth entry', () => {
        expect.assertions(1);
        expect(
          getPredictFromDate(now, {
            latestActualValues: [
              {
                date: new Date('2021-09-19'),
              } as LatestPlanningAccountValueRow,
            ],
          }),
        ).toStrictEqual(new Date('2021-10-01T00:00:00.000Z'));
      });
    });
  });
});

describe(getRelevantYears.name, () => {
  const previousIncomeRowBase = (): PreviousIncomeRow => ({} as PreviousIncomeRow);

  describe('when there are no recorded income values', () => {
    it('should return the inclusive range from the prediction start date to the selected year', () => {
      expect.assertions(5);
      expect(getRelevantYears(2021, new Date('2021-03-01'), [])).toStrictEqual([2020, 2021]);
      expect(getRelevantYears(2021, new Date('2021-04-01'), [])).toStrictEqual([2021]);
      expect(getRelevantYears(2022, new Date('2021-02-01'), [])).toStrictEqual([2020, 2021, 2022]);
      expect(getRelevantYears(2025, new Date('2021-02-01'), [])).toStrictEqual([
        2020, 2021, 2022, 2023, 2024, 2025,
      ]);
      expect(getRelevantYears(2023, new Date('2021-04-01'), [])).toStrictEqual([2021, 2022, 2023]);
    });

    describe('when the prediction start date is after the current date', () => {
      it('should return an inclusive range from the current date to the prediction start date', () => {
        expect.assertions(1);
        expect(getRelevantYears(2021, new Date('2023-04-01'), [])).toStrictEqual([
          2021, 2022, 2023,
        ]);
      });
    });
  });

  describe('when there are recorded income against a year after the selected year', () => {
    it('should return the inclusive range from the prediction start date to the selected year', () => {
      expect.assertions(1);
      expect(
        getRelevantYears(2018, new Date('2018-06-01'), [
          { ...previousIncomeRowBase(), year: 2020 },
          { ...previousIncomeRowBase(), year: 2020 },
          { ...previousIncomeRowBase(), year: 2022 },
        ]),
      ).toStrictEqual([2018]);
    });
  });

  describe('when there are recorded income against a year in the past', () => {
    it('should return the inclusive range from the oldest previous income entry to the selected year', () => {
      expect.assertions(1);
      expect(
        getRelevantYears(2023, new Date('2023-05-01'), [
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
  const creditCards: CalculationRows['creditCards'] = [];
  const valueRows: CalculationRows['valueRows'] = [];
  const billsRows: CalculationRows['billsRows'] = [];
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
        { latestActualValues, creditCards, valueRows, billsRows },
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
        { latestActualValues, creditCards, valueRows, billsRows },
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
        { latestActualValues, creditCards, valueRows, billsRows },
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
        { latestActualValues, creditCards, valueRows: valueRowsExample, billsRows },
        previousIncomeReduction,
        predictedIncomeReduction,
        predictedCreditCardPayments,
        transfersTo,
      );

      expect(result).toBeCloseTo(154420 - 142203);
    });
  });

  describe('when there are bills', () => {
    const billsExample: CalculationRows['billsRows'] = [
      {
        id: accountId,
        bills_date: new Date('2021-07-09'),
        bills_sum: -44523,
      },
      {
        id: accountId,
        bills_date: new Date('2022-04-22'),
        bills_sum: -1852,
      },
    ];

    it('should include those bills which occured between the net worth date and the current year', () => {
      expect.assertions(1);

      const result = getComputedYearStartAccountValue(
        accountId,
        now,
        year,
        { latestActualValues, creditCards, valueRows, billsRows: billsExample },
        previousIncomeReduction,
        predictedIncomeReduction,
        predictedCreditCardPayments,
        transfersTo,
      );

      expect(result).toBeCloseTo(154420 - 44523);
    });
  });

  describe('when there are actual credit card payments', () => {
    const ccExample: CalculationRows['creditCards'] = [
      {
        id: accountId,
        credit_card_id: numericHash('my-credit-card'),
        credit_card_payment_id: numericHash('my-credit-card-payment'),
        credit_card_payment_year: 2021,
        credit_card_payment_month: 7,
        credit_card_payment_value: -15540,
        credit_card_net_worth_subcategory_id: numericHash('my-credit-card-net-worth-subcategory'),
      },
    ];

    it('should take the card payments into account', () => {
      expect.assertions(1);

      const result = getComputedYearStartAccountValue(
        accountId,
        now,
        year,
        { latestActualValues, creditCards: ccExample, valueRows, billsRows },
        previousIncomeReduction,
        predictedIncomeReduction,
        {
          [numericHash('my-credit-card')]: 0,
        },
        transfersTo,
      );

      expect(result).toBeCloseTo(154420 - 15540);
    });

    describe('when there are multiple payments for the same credit card', () => {
      it('should only count the credit card once', () => {
        expect.assertions(1);

        const result = getComputedYearStartAccountValue(
          accountId,
          now,
          year,
          {
            latestActualValues,
            creditCards: [
              ccExample[0],
              { ...ccExample[0], credit_card_payment_month: 9, credit_card_payment_value: -61923 },
            ],
            valueRows,
            billsRows,
          },
          previousIncomeReduction,
          predictedIncomeReduction,
          {
            [numericHash('my-credit-card')]: 0,
          },
          transfersTo,
        );

        expect(result).toBeCloseTo(154420 - (15540 + 61923));
      });
    });
  });
});
