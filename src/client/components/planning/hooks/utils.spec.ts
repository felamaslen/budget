import type { State } from '../types';
import { isStateEqual } from './utils';

describe('isStateEqual', () => {
  const compareState: State = {
    year: 2021,
    accounts: [
      {
        netWorthSubcategoryId: 700,
        account: 'my-account',
        values: [{ id: 100, value: 364, formula: null, month: 4, name: 'Some name' }],
        creditCards: [
          {
            id: 200,
            netWorthSubcategoryId: 12,
            payments: [{ id: 201, value: -2766, month: 7 }],
            predictedPayment: 10032,
          },
        ],
        income: [
          {
            id: 600,
            startDate: '2021-01-02',
            endDate: '2022-03-10',
            taxCode: '1257L',
            salary: 8500000,
            pensionContrib: 0.03,
            studentLoan: false,
          },
        ],
        computedValues: [
          {
            key: 'my-computed-value',
            name: 'My computed value',
            month: 7,
            value: 1023,
            isVerified: true,
            isTransfer: false,
          },
        ],
      },
    ],
    parameters: {
      rates: [{ name: 'My rate', value: 0.452 }],
      thresholds: [{ name: 'My threshold', value: 89002 }],
    },
    taxReliefFromPreviousYear: 8723,
  };

  describe('when all the values are the same', () => {
    it('should return true', () => {
      expect.assertions(1);
      expect(isStateEqual(compareState, { ...compareState })).toBe(true);
    });
  });

  describe('when a value changed from undefined to null', () => {
    const stateWithUndefined: State = {
      ...compareState,
      accounts: [
        {
          ...compareState.accounts[0],
          values: [
            {
              ...compareState.accounts[0].values[0],
              formula: undefined,
            },
          ],
        },
      ],
    };

    it('should return true', () => {
      expect.assertions(1);
      expect(isStateEqual(compareState, stateWithUndefined)).toBe(true);
    });
  });

  describe('when a credit card predicted payment changed', () => {
    const stateWithChangedPredictedPayment: State = {
      ...compareState,
      accounts: [
        {
          ...compareState.accounts[0],
          creditCards: [
            {
              ...compareState.accounts[0].creditCards[0],
              predictedPayment:
                (compareState.accounts[0].creditCards[0].predictedPayment as number) + 1,
            },
          ],
        },
      ],
    };

    it('should return true', () => {
      expect.assertions(1);
      expect(isStateEqual(compareState, stateWithChangedPredictedPayment)).toBe(true);
    });
  });

  describe('when a computed value changed', () => {
    const stateWithChangedComputedValue: State = {
      ...compareState,
      accounts: [
        {
          ...compareState.accounts[0],
          computedValues: [
            {
              ...compareState.accounts[0].computedValues[0],
              name: 'Name changed innit',
            },
          ],
        },
      ],
    };

    it('should return true', () => {
      expect.assertions(1);
      expect(isStateEqual(compareState, stateWithChangedComputedValue)).toBe(true);
    });
  });

  describe('when the derived tax relief changed', () => {
    const stateWithChangedTaxRelief: State = {
      ...compareState,
      taxReliefFromPreviousYear: (compareState.taxReliefFromPreviousYear ?? 0) + 1,
    };

    it('should return true', () => {
      expect.assertions(1);
      expect(isStateEqual(compareState, stateWithChangedTaxRelief)).toBe(true);
    });
  });
});
