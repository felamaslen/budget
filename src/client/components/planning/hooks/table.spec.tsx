import { renderHook } from '@testing-library/react-hooks';
import React from 'react';
import { Provider } from 'react-redux';
import createMockStore from 'redux-mock-store';
import numericHash from 'string-hash';

import { StandardRates, StandardThresholds } from '../constants';
import { PlanningContext } from '../context';
import type { AccountValue } from '../month-end';
import type {
  AccountCreditCardPayment,
  AccountTransaction,
  PlanningContextState,
  PlanningData,
  State,
} from '../types';

import { usePlanningTableData } from './table';

import { TodayProvider } from '~client/hooks';
import type { State as ReduxState } from '~client/reducers';
import { testState as testReduxState } from '~client/test-data/state';
import { GQLProviderMock, mockClient } from '~client/test-utils/gql-provider-mock';
import { NetWorthEntryNative } from '~client/types';

describe(usePlanningTableData.name, () => {
  const now = new Date('2021-09-10T15:03:11+0100');
  beforeEach(() => {
    jest.useFakeTimers();
    jest.setSystemTime(now);
  });

  const myYear = 2021;

  const testReduxStateWithDates: ReduxState = {
    ...testReduxState,
    netWorth: {
      ...testReduxState.netWorth,
      entries: [
        new Date('2021-03-31'),
        new Date('2021-04-30'),
        new Date('2021-05-31'),
        new Date('2021-06-30'),
        new Date('2021-07-31'),
        new Date('2021-08-31'),
      ].map<NetWorthEntryNative>((date, index) => ({
        id: numericHash('real-entry-id-a'),
        date,
        values: [
          {
            subcategory: numericHash('real-locked-cash-subcategory-id'), // Savings
            simple: 1055030 + 100 * index,
          },
          {
            subcategory: numericHash('real-bank-subcategory-id'), // Checking
            simple: 196650 - 100 * index,
          },
        ],
        creditLimit: [],
        currencies: [],
      })),
    },
  };

  const testState: State = {
    parameters: [
      {
        year: 2021,
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
    ],
    accounts: [
      {
        id: numericHash('account-savings'),
        account: 'Savings',
        netWorthSubcategoryId: numericHash('real-locked-cash-subcategory-id'),
        values: [],
        income: [],
        pastIncome: [],
        creditCards: [],
      },
      {
        id: numericHash('account-checking'),
        account: 'Checking',
        netWorthSubcategoryId: numericHash('real-bank-subcategory-id'),
        values: [
          {
            id: numericHash('value-0'),
            year: 2021, // calendar year 2021
            month: 9,
            name: 'Transfer to savings',
            value: -120500,
            transferToAccountId: numericHash('account-savings'),
          },
          {
            id: numericHash('value-1'),
            year: 2021, // calendar year 2022
            month: 1,
            name: 'Car payment',
            value: -56293,
          },
          {
            id: numericHash('value-2'),
            year: 2022,
            month: 3,
            name: 'Transfer to savings',
            value: -150000,
            transferToAccountId: numericHash('account-savings'),
          },
          {
            id: numericHash('value-3'),
            year: 2021,
            month: 7,
            name: 'Pension (SIPP)',
            value: -50000,
          },
          {
            id: numericHash('value-4'),
            year: 2021,
            month: 7,
            name: 'My zero value',
            value: 0,
          },
        ],
        income: [
          {
            salary: 8500000,
            taxCode: '818L',
            startDate: '2021-08-11',
            endDate: '2022-03-31',
            pensionContrib: 0.03,
            studentLoan: true,
          },
        ],
        pastIncome: [
          { date: '2021-07-30', gross: 550000, deductions: [{ name: 'Tax', value: -105603 }] },
        ],
        creditCards: [
          {
            netWorthSubcategoryId: numericHash('real-credit-card-subcategory-id'),
            payments: [
              { id: numericHash('credit-card-payment-01'), year: 2021, month: 5, value: -15628 },
              { id: numericHash('credit-card-payment-02'), year: 2021, month: 7, value: -14892 },
              { id: numericHash('credit-card-payment-03'), year: 2021, month: 8, value: -39923 },
            ],
          },
        ],
      },
    ],
  };

  const testContext: PlanningContextState = {
    state: testState,
    local: {
      year: 2020,
    },
    isSynced: true,
    isLoading: false,
    error: null,
    table: [],
  };

  const createStore = createMockStore<ReduxState>();
  const store = createStore(testReduxStateWithDates);

  const Wrapper: React.FC = ({ children }) => (
    <GQLProviderMock client={mockClient}>
      <Provider store={store}>
        <TodayProvider>
          <PlanningContext.Provider value={testContext}>{children}</PlanningContext.Provider>
        </TodayProvider>
      </Provider>
    </GQLProviderMock>
  );

  it('should return twelve groups, corresponding to the months in the financial year', () => {
    expect.assertions(1);
    const { result } = renderHook(() => usePlanningTableData(testState, myYear), {
      wrapper: Wrapper,
    });
    expect(result.current).toHaveLength(12);
  });

  it("should set the numRows on the group to the minimum of 3, and the max of all of the group's accounts", () => {
    expect.assertions(12);
    const { result } = renderHook(() => usePlanningTableData(testState, myYear), {
      wrapper: Wrapper,
    });
    expect(result.current[0].numRows).toMatchInlineSnapshot(`3`); // April
    expect(result.current[1].numRows).toMatchInlineSnapshot(`3`); // May
    expect(result.current[2].numRows).toMatchInlineSnapshot(`3`); // June
    expect(result.current[3].numRows).toMatchInlineSnapshot(`4`); // July
    expect(result.current[4].numRows).toMatchInlineSnapshot(`4`); // August
    expect(result.current[5].numRows).toMatchInlineSnapshot(`7`); // September
    expect(result.current[6].numRows).toMatchInlineSnapshot(`8`); // October
    expect(result.current[7].numRows).toMatchInlineSnapshot(`7`); // November
    expect(result.current[8].numRows).toMatchInlineSnapshot(`7`); // December
    expect(result.current[9].numRows).toMatchInlineSnapshot(`7`); // January
    expect(result.current[10].numRows).toMatchInlineSnapshot(`8`); // March
    expect(result.current[11].numRows).toMatchInlineSnapshot(`7`); // April
  });

  it('should set isCurrentMonth to true on the current month', () => {
    expect.assertions(12);
    // current month is September
    const { result } = renderHook(() => usePlanningTableData(testState, myYear), {
      wrapper: Wrapper,
    });
    expect(result.current[0].isCurrentMonth).toBe(false); // April
    expect(result.current[1].isCurrentMonth).toBe(false); // May
    expect(result.current[2].isCurrentMonth).toBe(false); // June
    expect(result.current[3].isCurrentMonth).toBe(false); // July
    expect(result.current[4].isCurrentMonth).toBe(false); // August
    expect(result.current[5].isCurrentMonth).toBe(true); // September
    expect(result.current[6].isCurrentMonth).toBe(false); // October
    expect(result.current[7].isCurrentMonth).toBe(false); // November
    expect(result.current[8].isCurrentMonth).toBe(false); // December
    expect(result.current[9].isCurrentMonth).toBe(false); // January
    expect(result.current[10].isCurrentMonth).toBe(false); // February
    expect(result.current[11].isCurrentMonth).toBe(false); // March
  });

  describe('accounts', () => {
    it('should each be present on every group', () => {
      expect.assertions(24);
      const { result } = renderHook(() => usePlanningTableData(testState, myYear), {
        wrapper: Wrapper,
      });
      result.current.forEach((group) => {
        expect(group.accounts).toHaveLength(2);
        expect(group.accounts).toStrictEqual(
          expect.arrayContaining([
            expect.objectContaining({
              accountGroup: expect.objectContaining<Partial<State['accounts'][0]>>({
                account: 'Savings',
                income: [],
                pastIncome: [],
                creditCards: [],
              }),
            }),
            expect.objectContaining({
              accountGroup: expect.objectContaining<Partial<State['accounts'][0]>>({
                account: 'Checking',
              }),
            }),
          ]),
        );
      });
    });

    it('should include explicit transactions', () => {
      expect.assertions(2);
      const { result } = renderHook(() => usePlanningTableData(testState, myYear), {
        wrapper: Wrapper,
      });

      expect(result.current[6].accounts[1].transactions).toStrictEqual(
        expect.arrayContaining([
          expect.objectContaining<AccountTransaction>({
            id: numericHash('value-0'),
            name: 'Transfer to savings',
            value: -120500,
            formula: undefined,
            computedValue: -120500,
            isVerified: false,
            isTransfer: true,
          }),
        ]),
      );

      expect(result.current[10].accounts[1].transactions).toStrictEqual(
        expect.arrayContaining([
          expect.objectContaining<AccountTransaction>({
            id: numericHash('value-1'),
            name: 'Car payment',
            value: -56293,
            formula: undefined,
            computedValue: -56293,
            isVerified: false,
          }),
        ]),
      );
    });

    it('should include calculated transfer-to transactions from other accounts', () => {
      expect.assertions(1);
      const { result } = renderHook(() => usePlanningTableData(testState, myYear), {
        wrapper: Wrapper,
      });

      expect(result.current[6].accounts[0].transactions).toStrictEqual(
        expect.arrayContaining([
          expect.objectContaining<AccountTransaction>({
            id: `${numericHash('value-0')}-transfer-to`,
            name: 'Checking transfer',
            computedValue: 120500,
            isVerified: false, // since it's in the future
            isComputed: true,
            isTransfer: true,
          }),
        ]),
      );
    });

    it('should include verified income transactions, including deductions', () => {
      expect.assertions(1);
      const { result } = renderHook(() => usePlanningTableData(testState, myYear), {
        wrapper: Wrapper,
      });
      expect(result.current[3].accounts[1].transactions).toStrictEqual(
        expect.arrayContaining([
          expect.objectContaining<AccountTransaction>({
            id: `salary-${'2021-07-31T23:59:59.999Z'}`,
            name: 'Salary',
            computedValue: 550000,
            isComputed: true,
            isVerified: true,
          }),
          expect.objectContaining<AccountTransaction>({
            id: `deduction-Tax--105603`,
            name: 'Tax',
            computedValue: -105603,
            isComputed: true,
            isVerified: true,
          }),
        ]),
      );
    });

    it('should include manual transactions, including those with zero value', () => {
      expect.assertions(1);
      const { result } = renderHook(() => usePlanningTableData(testState, myYear), {
        wrapper: Wrapper,
      });
      expect(result.current[4].accounts[1].transactions).toStrictEqual(
        expect.arrayContaining([
          expect.objectContaining<AccountTransaction>({
            id: numericHash('value-3'),
            name: 'Pension (SIPP)',
            computedValue: -50000,
          }),
          expect.objectContaining<AccountTransaction>({
            id: numericHash('value-4'),
            name: 'My zero value',
            computedValue: 0,
          }),
        ]),
      );
    });

    it('should include predicted income transactions, for future months', () => {
      expect.assertions(11);
      const { result } = renderHook(() => usePlanningTableData(testState, myYear), {
        wrapper: Wrapper,
      });

      // Apr
      expect(result.current[0].accounts[1].transactions).not.toStrictEqual(
        expect.arrayContaining([expect.objectContaining({ name: 'Salary' })]),
      );

      // May
      expect(result.current[1].accounts[1].transactions).not.toStrictEqual(
        expect.arrayContaining([expect.objectContaining({ name: 'Salary' })]),
      );

      // Jun
      expect(result.current[2].accounts[1].transactions).not.toStrictEqual(
        expect.arrayContaining([expect.objectContaining({ name: 'Salary' })]),
      );

      // Aug
      expect(result.current[4].accounts[1].transactions).not.toStrictEqual(
        expect.arrayContaining([expect.objectContaining({ name: 'Salary' })]),
      );

      // Sep
      expect(result.current[5].accounts[1].transactions).toStrictEqual(
        expect.arrayContaining([
          expect.objectContaining({
            id: 'salary-predicted',
            name: 'Salary',
            computedValue: 708333,
            isComputed: true,
            isVerified: false,
          }),
          expect.objectContaining({
            id: 'income-tax-predicted',
            name: 'Income tax',
            computedValue: -185067,
            isComputed: true,
            isVerified: false,
          }),
          expect.objectContaining({
            id: 'ni-predicted',
            name: 'NI',
            computedValue: -46068,
            isComputed: true,
            isVerified: false,
          }),
          expect.objectContaining({
            id: 'student-loan-predicted',
            name: 'Student loan',
            computedValue: -41366,
            isComputed: true,
            isVerified: false,
          }),
          expect.objectContaining({
            id: 'pension-predicted',
            name: 'Pension (SalSac)',
            computedValue: -21250,
            isComputed: true,
            isVerified: false,
          }),
        ]),
      );

      // Oct
      expect(result.current[6].accounts[1].transactions).toStrictEqual([
        ...result.current[5].accounts[1].transactions,
        expect.objectContaining({
          id: numericHash('value-0'),
          name: 'Transfer to savings',
          computedValue: -120500,
          formula: undefined,
          value: -120500,
          isVerified: false,
        }),
      ]);

      // Nov
      expect(result.current[7].accounts[1].transactions).toStrictEqual(
        result.current[5].accounts[1].transactions,
      );

      // Dec
      expect(result.current[8].accounts[1].transactions).toStrictEqual(
        result.current[5].accounts[1].transactions,
      );

      // Jan
      expect(result.current[9].accounts[1].transactions).toStrictEqual(
        result.current[5].accounts[1].transactions,
      );

      // Feb
      expect(result.current[10].accounts[1].transactions).toStrictEqual(
        expect.arrayContaining(result.current[5].accounts[1].transactions),
      );

      // Mar
      expect(result.current[11].accounts[1].transactions).toStrictEqual(
        result.current[5].accounts[1].transactions,
      );
    });

    it('should include actual credit card transactions', () => {
      expect.assertions(3);
      const { result } = renderHook(() => usePlanningTableData(testState, myYear), {
        wrapper: Wrapper,
      });

      // Jun
      expect(result.current[2].accounts[1].creditCards).toStrictEqual<AccountCreditCardPayment[]>([
        {
          netWorthSubcategoryId: numericHash('real-credit-card-subcategory-id'),
          name: 'My credit card',
          value: -15628,
          isVerified: true,
        },
      ]);

      // Aug
      expect(result.current[4].accounts[1].creditCards).toStrictEqual<AccountCreditCardPayment[]>([
        {
          netWorthSubcategoryId: numericHash('real-credit-card-subcategory-id'),
          name: 'My credit card',
          value: -14892,
          isVerified: true,
        },
      ]);

      // Sep (current month)
      expect(result.current[5].accounts[1].creditCards).toStrictEqual<AccountCreditCardPayment[]>([
        {
          netWorthSubcategoryId: numericHash('real-credit-card-subcategory-id'),
          name: 'My credit card',
          value: -39923,
          isVerified: true,
        },
      ]);
    });

    it('should include predicted credit card transactions, based on the median value', () => {
      expect.assertions(9);
      const { result } = renderHook(() => usePlanningTableData(testState, myYear), {
        wrapper: Wrapper,
      });

      // Apr
      expect(result.current[0].accounts[1].creditCards).toStrictEqual<AccountCreditCardPayment[]>([
        {
          netWorthSubcategoryId: numericHash('real-credit-card-subcategory-id'),
          name: 'My credit card',
          value: undefined,
          isVerified: false,
        },
      ]);
      // May
      expect(result.current[1].accounts[1].creditCards).toStrictEqual(
        result.current[0].accounts[1].creditCards,
      );
      // Jul
      expect(result.current[3].accounts[1].creditCards).toStrictEqual(
        result.current[0].accounts[1].creditCards,
      );

      // Oct
      expect(result.current[6].accounts[1].creditCards).toStrictEqual<AccountCreditCardPayment[]>([
        {
          netWorthSubcategoryId: numericHash('real-credit-card-subcategory-id'),
          name: 'My credit card',
          value: -15628,
          isVerified: false,
        },
      ]);
      // Nov
      expect(result.current[7].accounts[1].creditCards).toStrictEqual(
        result.current[6].accounts[1].creditCards,
      );
      // Dec
      expect(result.current[8].accounts[1].creditCards).toStrictEqual(
        result.current[6].accounts[1].creditCards,
      );
      // Jan
      expect(result.current[9].accounts[1].creditCards).toStrictEqual(
        result.current[6].accounts[1].creditCards,
      );
      // Feb
      expect(result.current[10].accounts[1].creditCards).toStrictEqual(
        result.current[6].accounts[1].creditCards,
      );
      // Mar
      expect(result.current[11].accounts[1].creditCards).toStrictEqual(
        result.current[6].accounts[1].creditCards,
      );
    });

    describe('start and end values', () => {
      it('should return undefined for past months with no net worth entry', () => {
        expect.assertions(4);
        const { result } = renderHook(() => usePlanningTableData(testState, myYear - 1), {
          wrapper: Wrapper,
        });

        expect(result.current[0].accounts[0].startValue).toStrictEqual<AccountValue>({
          id: `${numericHash('account-savings')}_start`,
          name: 'Savings',
          computedValue: undefined,
          isComputed: true,
          isVerified: false,
        });
        expect(result.current[0].accounts[1].startValue).toStrictEqual<AccountValue>({
          id: `${numericHash('account-checking')}_start`,
          name: 'Checking',
          computedValue: undefined,
          isComputed: true,
          isVerified: false,
        });

        expect(result.current[0].accounts[0].endValue).toStrictEqual<AccountValue>({
          id: `${numericHash('account-savings')}_end`,
          name: 'Savings',
          computedValue: undefined,
          isComputed: true,
          isVerified: false,
        });
        expect(result.current[0].accounts[1].endValue).toStrictEqual<AccountValue>({
          id: `${numericHash('account-checking')}_end`,
          name: 'Checking',
          computedValue: undefined,
          isComputed: true,
          isVerified: false,
        });
      });

      it.each`
        month    | index | start0               | start1              | end0                 | end1
        ${'Apr'} | ${0}  | ${1055030}           | ${196650}           | ${1055030 + 100 * 1} | ${196650 - 100 * 1}
        ${'May'} | ${1}  | ${1055030 + 100 * 1} | ${196650 - 100 * 1} | ${1055030 + 100 * 2} | ${196650 - 100 * 2}
        ${'Jun'} | ${2}  | ${1055030 + 100 * 2} | ${196650 - 100 * 2} | ${1055030 + 100 * 3} | ${196650 - 100 * 3}
        ${'Jul'} | ${3}  | ${1055030 + 100 * 3} | ${196650 - 100 * 3} | ${1055030 + 100 * 4} | ${196650 - 100 * 4}
        ${'Aug'} | ${4}  | ${1055030 + 100 * 4} | ${196650 - 100 * 4} | ${1055030 + 100 * 5} | ${196650 - 100 * 5}
      `(
        'should return actual values for a past month ($month) with a net worth entry',
        ({ index, start0, start1, end0, end1 }) => {
          expect.assertions(4);
          const { result } = renderHook(() => usePlanningTableData(testState, myYear), {
            wrapper: Wrapper,
          });

          expect(result.current[index].accounts[0].startValue).toStrictEqual<AccountValue>({
            id: `${numericHash('account-savings')}_start`,
            name: 'Savings',
            computedValue: start0,
            isComputed: true,
            isVerified: true,
          });
          expect(result.current[index].accounts[1].startValue).toStrictEqual<AccountValue>({
            id: `${numericHash('account-checking')}_start`,
            name: 'Checking',
            computedValue: start1,
            isComputed: true,
            isVerified: true,
          });

          expect(result.current[index].accounts[0].endValue).toStrictEqual<AccountValue>({
            id: `${numericHash('account-savings')}_end`,
            name: 'Savings',
            computedValue: end0,
            isComputed: true,
            isVerified: true,
          });
          expect(result.current[index].accounts[1].endValue).toStrictEqual<AccountValue>({
            id: `${numericHash('account-checking')}_end`,
            name: 'Checking',
            computedValue: end1,
            isComputed: true,
            isVerified: true,
          });
        },
      );

      it('should return a predicted value for a present month without a net worth entry', () => {
        expect.assertions(4);
        const { result } = renderHook(() => usePlanningTableData(testState, myYear), {
          wrapper: Wrapper,
        });

        expect(result.current[5].accounts[0].startValue).toStrictEqual<AccountValue>({
          id: `${numericHash('account-savings')}_start`,
          name: 'Savings',
          computedValue: 1055030 + 100 * 5,
          isComputed: true,
          isVerified: true,
        });
        expect(result.current[5].accounts[1].startValue).toStrictEqual<AccountValue>({
          id: `${numericHash('account-checking')}_start`,
          name: 'Checking',
          computedValue: 196650 - 100 * 5,
          isComputed: true,
          isVerified: true,
        });

        expect(result.current[5].accounts[0].endValue).toStrictEqual<AccountValue>({
          id: `${numericHash('account-savings')}_end`,
          name: 'Savings',
          computedValue: 1055030 + 100 * 5,
          isComputed: true,
          isVerified: false,
        });
        expect(result.current[5].accounts[1].endValue).toStrictEqual<AccountValue>({
          id: `${numericHash('account-checking')}_end`,
          name: 'Checking',
          computedValue: 196650 - 100 * 5 + (708333 - 185067 - 46068 - 41366 - 21250) - 39923,
          isComputed: true,
          isVerified: false,
        });
      });

      const expectedCheckingSep =
        196650 - 100 * 5 + (708333 - 185067 - 46068 - 41366 - 21250) - 39923;
      const expectedSavingSep = 1055030 + 100 * 5;

      const expectedCheckingOct =
        expectedCheckingSep + (708333 - 185067 - 46068 - 41366 - 21250) - 15628 - 120500;
      const expectedSavingOct = expectedSavingSep + 120500;

      const expectedCheckingNov =
        expectedCheckingOct + (708333 - 185067 - 46068 - 41366 - 21250) - 15628;
      const expectedSavingNov = expectedSavingOct;

      const expectedCheckingDec =
        expectedCheckingNov + (708333 - 185067 - 46068 - 41366 - 21250) - 15628;
      const expectedSavingDec = expectedSavingNov;

      it.each`
        month    | index | start0               | start1                 | end0                 | end1
        ${'Oct'} | ${6}  | ${expectedSavingSep} | ${expectedCheckingSep} | ${expectedSavingOct} | ${expectedCheckingOct}
        ${'Nov'} | ${7}  | ${expectedSavingOct} | ${expectedCheckingOct} | ${expectedSavingNov} | ${expectedCheckingNov}
        ${'Dec'} | ${8}  | ${expectedSavingNov} | ${expectedCheckingNov} | ${expectedSavingDec} | ${expectedCheckingDec}
      `(
        'should return predicted values for a future month ($month) without a net worth entry',
        ({ index, start0, start1, end0, end1 }) => {
          expect.assertions(4);
          const { result } = renderHook(() => usePlanningTableData(testState, myYear), {
            wrapper: Wrapper,
          });

          expect(result.current[index].accounts[0].startValue).toStrictEqual<AccountValue>({
            id: `${numericHash('account-savings')}_start`,
            name: 'Savings',
            computedValue: start0,
            isComputed: true,
            isVerified: false,
          });
          expect(result.current[index].accounts[1].startValue).toStrictEqual<AccountValue>({
            id: `${numericHash('account-checking')}_start`,
            name: 'Checking',
            computedValue: start1,
            isComputed: true,
            isVerified: false,
          });

          expect(result.current[index].accounts[0].endValue).toStrictEqual<AccountValue>({
            id: `${numericHash('account-savings')}_end`,
            name: 'Savings',
            computedValue: end0,
            isComputed: true,
            isVerified: false,
          });
          expect(result.current[index].accounts[1].endValue).toStrictEqual<AccountValue>({
            id: `${numericHash('account-checking')}_end`,
            name: 'Checking',
            computedValue: end1,
            isComputed: true,
            isVerified: false,
          });
        },
      );
    });

    describe('when the first month is in the future', () => {
      it('should include pension tax relief from the previous year', () => {
        expect.assertions(1);
        jest.useFakeTimers();
        jest.setSystemTime(new Date('2021-04-03'));

        const { result } = renderHook(() => usePlanningTableData(testState, 2022), {
          wrapper: Wrapper,
        });

        expect(result.current).toStrictEqual(
          expect.arrayContaining([
            expect.objectContaining<Partial<PlanningData>>({
              date: new Date('2022-04-30T23:59:59.999Z'),
              year: 2022,
              month: 3,
              accounts: expect.arrayContaining([
                expect.objectContaining<Partial<PlanningData['accounts'][0]>>({
                  previousYearTaxRelief: 50000 * 0.4,
                }),
              ]),
            }),
          ]),
        );
      });
    });
  });

  describe('when fetching a year in the future', () => {
    const expectedSavingSep21 = 1055030 + 100 * 5;
    const expectedSavingOct21 = expectedSavingSep21 + 120500;
    const expectedSavingMar21 = expectedSavingOct21; // no other transactions

    const expectedCheckingAug21 = 196650 - 100 * 5; // from net worth entry
    const expectedCheckingSep21 =
      expectedCheckingAug21 + (708333 - 185067 - 46068 - 41366 - 21250) - 39923;
    const expectedCheckingOct21 =
      expectedCheckingSep21 + (708333 - 185067 - 46068 - 41366 - 21250) - 15628 - 120500;
    const expectedCheckingNov21 =
      expectedCheckingOct21 + (708333 - 185067 - 46068 - 41366 - 21250) - 15628;
    const expectedCheckingDec21 =
      expectedCheckingNov21 + (708333 - 185067 - 46068 - 41366 - 21250) - 15628;
    const expectedCheckingJan22 =
      expectedCheckingDec21 + (708333 - 185067 - 46068 - 41366 - 21250) - 15628;
    const expectedCheckingFeb22 =
      expectedCheckingJan22 + (708333 - 185067 - 46068 - 41366 - 21250) - 15628 - 56293;
    const expectedCheckingMar22 =
      expectedCheckingFeb22 + (708333 - 185067 - 46068 - 41366 - 21250) - 15628;
    const expectedCheckingApr22 = expectedCheckingMar22 - 15628 - 150000;

    it('should extrapolate boundary conditions from the latest actual net worth value', () => {
      expect.assertions(4);
      const { result } = renderHook(() => usePlanningTableData(testState, 2022), {
        wrapper: Wrapper,
      });

      expect(result.current[0].accounts[0].startValue.computedValue).toBe(expectedSavingMar21);
      expect(result.current[0].accounts[0].endValue.computedValue).toBe(
        expectedSavingMar21 + 150000,
      );

      expect(result.current[0].accounts[1].startValue.computedValue).toBe(expectedCheckingMar22);
      expect(result.current[0].accounts[1].endValue.computedValue).toBe(expectedCheckingApr22);
    });

    it('should extrapolate credit card payments from the previous year', () => {
      expect.assertions(2);
      const { result } = renderHook(() => usePlanningTableData(testState, 2022), {
        wrapper: Wrapper,
      });

      expect(result.current[1].accounts[1].startValue.computedValue).toBe(expectedCheckingApr22);
      expect(result.current[1].accounts[1].endValue.computedValue).toBe(
        expectedCheckingApr22 - 15628,
      );
    });
  });
});
