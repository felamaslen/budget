import numericHash from 'string-hash';

import { testState } from '../__tests__/fixtures';

import { PlanningContext } from '../context';
import type { AccountValue } from '../month-end';
import type {
  AccountCreditCardPayment,
  AccountTransaction,
  PlanningContextState,
  State,
} from '../types';

import { usePlanningTableData } from './table';

import { TodayProvider } from '~client/hooks';
import type { State as ReduxState } from '~client/reducers';
import { testState as testReduxState } from '~client/test-data/state';
import { renderHookWithStore } from '~client/test-utils';
import { NetWorthEntryNative } from '~client/types';

describe(usePlanningTableData.name, () => {
  const now = new Date('2020-09-10T15:03:11+0100');
  beforeEach(() => {
    jest.useFakeTimers();
    jest.setSystemTime(now);
  });

  const testReduxStateWithDates: ReduxState = {
    ...testReduxState,
    netWorth: {
      ...testReduxState.netWorth,
      entries: [
        new Date('2020-03-31'),
        new Date('2020-04-30'),
        new Date('2020-05-31'),
        new Date('2020-06-30'),
        new Date('2020-07-31'),
        new Date('2020-08-31'),
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

  const testContext: PlanningContextState = {
    localYear: 2020,
    state: testState,
    isSynced: true,
    isLoading: false,
    error: null,
    table: [],
  };

  const wrapper: React.FC = ({ children }) => (
    <TodayProvider>
      <PlanningContext.Provider value={testContext}>{children}</PlanningContext.Provider>
    </TodayProvider>
  );

  // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
  const setup = (state: State = testState) =>
    renderHookWithStore(() => usePlanningTableData(state), {
      customState: testReduxStateWithDates,
      renderHookOptions: {
        wrapper,
      },
    });

  it('should return twelve groups, corresponding to the months in the financial year', () => {
    expect.assertions(1);
    const { result } = setup();
    expect(result.current).toHaveLength(12);
  });

  it("should set the numRows on the group to the minimum of 3, and the max of all of the group's accounts", () => {
    expect.assertions(12);
    const { result } = setup();
    expect(result.current[0].numRows).toMatchInlineSnapshot(`3`); // April
    expect(result.current[1].numRows).toMatchInlineSnapshot(`3`); // May
    expect(result.current[2].numRows).toMatchInlineSnapshot(`3`); // June
    expect(result.current[3].numRows).toMatchInlineSnapshot(`4`); // July
    expect(result.current[4].numRows).toMatchInlineSnapshot(`4`); // August
    expect(result.current[5].numRows).toMatchInlineSnapshot(`5`); // September
    expect(result.current[6].numRows).toMatchInlineSnapshot(`4`); // October
    expect(result.current[7].numRows).toMatchInlineSnapshot(`3`); // November
    expect(result.current[8].numRows).toMatchInlineSnapshot(`4`); // December
    expect(result.current[9].numRows).toMatchInlineSnapshot(`3`); // January
    expect(result.current[10].numRows).toMatchInlineSnapshot(`4`); // March
    expect(result.current[11].numRows).toMatchInlineSnapshot(`3`); // April
  });

  it('should set isCurrentMonth to true on the current month', () => {
    expect.assertions(12);
    // current month is September
    const { result } = setup();
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

  it('should set the current month when prior to the FY start', () => {
    expect.assertions(12);
    jest.setSystemTime(new Date('2021-01-04T11:32:10Z'));
    const { result } = setup();
    expect(result.current[0].isCurrentMonth).toBe(false); // April
    expect(result.current[1].isCurrentMonth).toBe(false); // May
    expect(result.current[2].isCurrentMonth).toBe(false); // June
    expect(result.current[3].isCurrentMonth).toBe(false); // July
    expect(result.current[4].isCurrentMonth).toBe(false); // August
    expect(result.current[5].isCurrentMonth).toBe(false); // September
    expect(result.current[6].isCurrentMonth).toBe(false); // October
    expect(result.current[7].isCurrentMonth).toBe(false); // November
    expect(result.current[8].isCurrentMonth).toBe(false); // December
    expect(result.current[9].isCurrentMonth).toBe(true); // January
    expect(result.current[10].isCurrentMonth).toBe(false); // February
    expect(result.current[11].isCurrentMonth).toBe(false); // March
  });

  describe('accounts', () => {
    it('should each be present on every group', () => {
      expect.assertions(24);
      const { result } = setup();
      result.current.forEach((group) => {
        expect(group.accounts).toHaveLength(2);
        expect(group.accounts).toStrictEqual(
          expect.arrayContaining([
            expect.objectContaining({
              accountGroup: expect.objectContaining<Partial<State['accounts'][0]>>({
                account: 'Savings',
                income: [],
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

    describe('explicit transactions', () => {
      it('should be included', () => {
        expect.assertions(2);
        const { result } = setup();

        expect(result.current[6].accounts[1].transactions).toStrictEqual(
          expect.arrayContaining([
            expect.objectContaining<AccountTransaction>({
              key: `manual-transaction-${numericHash('value-0')}`,
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
              key: `manual-transaction-${numericHash('value-1')}`,
              name: 'Car payment',
              value: -56293,
              formula: undefined,
              computedValue: -56293,
              isVerified: false,
            }),
          ]),
        );
      });

      it('should be included when the value is zero', () => {
        expect.assertions(1);
        const { result } = setup();
        expect(result.current[4].accounts[1].transactions).toStrictEqual(
          expect.arrayContaining([
            expect.objectContaining<AccountTransaction>({
              key: `manual-transaction-${numericHash('value-3')}`,
              name: 'Pension (SIPP)',
              computedValue: -50000,
            }),
            expect.objectContaining<AccountTransaction>({
              key: `manual-transaction-${numericHash('value-4')}`,
              name: 'My zero value',
              computedValue: 0,
            }),
          ]),
        );
      });
    });

    it('should include computed transactions', () => {
      expect.assertions(2);
      const { result } = setup();

      expect(result.current[6].accounts[0].transactions).toStrictEqual(
        expect.arrayContaining([
          expect.objectContaining<AccountTransaction>({
            key: 'transfer-2020-9-savings',
            name: 'Checking transfer',
            computedValue: 120500,
            isComputed: true,
            isVerified: false,
            isTransfer: true,
          }),
        ]),
      );

      expect(result.current[5].accounts[1].transactions).toStrictEqual(
        expect.arrayContaining([
          expect.objectContaining<AccountTransaction>({
            key: `salary-2020-09-30`,
            name: 'Salary',
            computedValue: 550000,
            isComputed: true,
            isVerified: true,
            isTransfer: false,
          }),
          expect.objectContaining<AccountTransaction>({
            key: `deduction-2020-09-30-Tax`,
            name: 'Income tax',
            computedValue: -105603,
            isComputed: true,
            isVerified: true,
            isTransfer: false,
          }),
        ]),
      );
    });

    it('should add a color scale to income transactions', () => {
      expect.assertions(6);
      const { result } = setup();

      const salaryVerifiedJul = result.current[3].accounts[1].transactions.find(
        (compare) => compare.name === 'Salary',
      );

      const salaryVerifiedSep = result.current[5].accounts[1].transactions.find(
        (compare) => compare.name === 'Salary',
      );
      const salaryPredictedDec = result.current[8].accounts[1].transactions.find(
        (compare) => compare.name === 'Salary',
      );

      expect(salaryVerifiedJul?.color).toBeDefined();
      expect(salaryVerifiedSep?.color).toBeDefined();
      expect(salaryPredictedDec?.color).toBeDefined();

      expect(salaryVerifiedJul?.color).toMatchInlineSnapshot(`"#7ae35a"`);
      expect(salaryVerifiedSep?.color).toMatchInlineSnapshot(`"#6de149"`);
      expect(salaryPredictedDec?.color).toMatchInlineSnapshot(`"#43d815"`);
    });

    it('should include actual credit card transactions', () => {
      expect.assertions(3);
      const { result } = setup();

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

    it('should fall back to predicted credit card payments, for future months', () => {
      expect.assertions(9);
      const { result } = setup();

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
          value: -20156,
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
      it('should return the initial value from the API', () => {
        expect.assertions(4);
        const { result } = setup();

        expect(result.current[0].accounts[0].startValue).toStrictEqual<AccountValue>({
          key: `${numericHash('account-savings')}_start`,
          name: 'Savings',
          computedValue: 966720,
          isComputed: true,
          isVerified: true,
        });
        expect(result.current[0].accounts[1].startValue).toStrictEqual<AccountValue>({
          key: `${numericHash('account-checking')}_start`,
          name: 'Checking',
          computedValue: 195562,
          isComputed: true,
          isVerified: true,
        });

        expect(result.current[0].accounts[0].endValue).toStrictEqual<AccountValue>({
          key: `${numericHash('account-savings')}_end`,
          name: 'Savings',
          computedValue: 1055130, // from net worth entry
          isComputed: true,
          isVerified: true,
        });
        expect(result.current[0].accounts[1].endValue).toStrictEqual<AccountValue>({
          key: `${numericHash('account-checking')}_end`,
          name: 'Checking',
          computedValue: 196550, // from net worth entry
          isComputed: true,
          isVerified: true,
        });
      });

      it.each`
        month    | index | start0               | start1              | end0                 | end1
        ${'Apr'} | ${0}  | ${966720}            | ${195562}           | ${1055030 + 100 * 1} | ${196650 - 100 * 1}
        ${'May'} | ${1}  | ${1055030 + 100 * 1} | ${196650 - 100 * 1} | ${1055030 + 100 * 2} | ${196650 - 100 * 2}
        ${'Jun'} | ${2}  | ${1055030 + 100 * 2} | ${196650 - 100 * 2} | ${1055030 + 100 * 3} | ${196650 - 100 * 3}
        ${'Jul'} | ${3}  | ${1055030 + 100 * 3} | ${196650 - 100 * 3} | ${1055030 + 100 * 4} | ${196650 - 100 * 4}
        ${'Aug'} | ${4}  | ${1055030 + 100 * 4} | ${196650 - 100 * 4} | ${1055030 + 100 * 5} | ${196650 - 100 * 5}
      `(
        'should return actual values for a past month ($month) with a net worth entry',
        ({ index, start0, start1, end0, end1 }) => {
          expect.assertions(4);
          const { result } = setup();

          expect(result.current[index].accounts[0].startValue).toStrictEqual<AccountValue>({
            key: `${numericHash('account-savings')}_start`,
            name: 'Savings',
            computedValue: start0,
            isComputed: true,
            isVerified: true,
          });
          expect(result.current[index].accounts[1].startValue).toStrictEqual<AccountValue>({
            key: `${numericHash('account-checking')}_start`,
            name: 'Checking',
            computedValue: start1,
            isComputed: true,
            isVerified: true,
          });

          expect(result.current[index].accounts[0].endValue).toStrictEqual<AccountValue>({
            key: `${numericHash('account-savings')}_end`,
            name: 'Savings',
            computedValue: end0,
            isComputed: true,
            isVerified: true,
          });
          expect(result.current[index].accounts[1].endValue).toStrictEqual<AccountValue>({
            key: `${numericHash('account-checking')}_end`,
            name: 'Checking',
            computedValue: end1,
            isComputed: true,
            isVerified: true,
          });
        },
      );

      it('should return a predicted value for a present month without a net worth entry', () => {
        expect.assertions(4);
        const { result } = setup();

        expect(result.current[5].accounts[0].startValue).toStrictEqual<AccountValue>({
          key: `${numericHash('account-savings')}_start`,
          name: 'Savings',
          computedValue: 1055030 + 100 * 5,
          isComputed: true,
          isVerified: true,
        });
        expect(result.current[5].accounts[1].startValue).toStrictEqual<AccountValue>({
          key: `${numericHash('account-checking')}_start`,
          name: 'Checking',
          computedValue: 196650 - 100 * 5,
          isComputed: true,
          isVerified: true,
        });

        expect(result.current[5].accounts[0].endValue).toStrictEqual<AccountValue>({
          key: `${numericHash('account-savings')}_end`,
          name: 'Savings',
          computedValue: 1055030 + 100 * 5,
          isComputed: true,
          isVerified: false,
        });
        expect(result.current[5].accounts[1].endValue).toStrictEqual<AccountValue>({
          key: `${numericHash('account-checking')}_end`,
          name: 'Checking',
          computedValue: 196650 - 100 * 5 + 550000 - 105603 - 39923 - 15623,
          isComputed: true,
          isVerified: false,
        });
      });
    });
  });

  describe('when fetching a year in the future', () => {
    const startValueSaving = 996712;
    const startValueChecking = 255610;

    const expectedCheckingApr22 = startValueChecking - 14487 - 150000;
    const expectedSavingApr22 = startValueSaving + 150000;

    const stateInFuture: State = {
      ...testState,
      year: 2022,
      accounts: [
        {
          ...testState.accounts[0],
          computedStartValue: startValueSaving,
          creditCards: [],
          computedValues: [
            {
              key: `tranfser-checking`,
              month: 3,
              name: 'Transfer from checking',
              value: 150000,
              isTransfer: true,
              isVerified: true,
            },
          ],
          values: [],
        },
        {
          ...testState.accounts[1],
          computedStartValue: startValueChecking,
          creditCards: [
            {
              netWorthSubcategoryId: numericHash('real-credit-card-subcategory-id'),
              payments: [{ id: numericHash('credit-card-payment-01'), month: 3, value: -14487 }],
              predictedPayment: -19230,
            },
          ],
          values: [
            {
              id: numericHash('my-transfer'),
              month: 3,
              name: 'Transfer out',
              value: -150000,
              formula: null,
              transferToAccountId: testState.accounts[1].id,
            },
          ],
        },
      ],
    };

    it('should use the boundary conditions provided by the API', () => {
      expect.assertions(4);
      const { result } = setup(stateInFuture);

      expect(result.current[0].accounts[0].startValue.computedValue).toBe(startValueSaving);
      expect(result.current[0].accounts[0].endValue.computedValue).toBe(expectedSavingApr22);

      expect(result.current[0].accounts[1].startValue.computedValue).toBe(startValueChecking);
      expect(result.current[0].accounts[1].endValue.computedValue).toBe(expectedCheckingApr22);
    });
  });
});
