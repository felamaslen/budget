import type { State } from '../types';
import { isStateEqual } from './utils';

describe('isStateEqual', () => {
  const compareState: State = {
    accounts: [
      {
        netWorthSubcategoryId: 700,
        account: 'my-account',
        values: [{ id: 100, value: 364, formula: null, year: 2021, month: 4, name: 'Some name' }],
        creditCards: [
          {
            id: 200,
            netWorthSubcategoryId: 12,
            payments: [{ id: 201, value: -2766, year: 2021, month: 7 }],
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
        pastIncome: [
          { date: '2020-12-10', gross: 6600000, deductions: [{ name: 'Tax', value: -125039 }] },
        ],
      },
    ],
    parameters: [
      {
        year: 2021,
        rates: [{ name: 'My rate', value: 0.452 }],
        thresholds: [{ name: 'My threshold', value: 89002 }],
      },
    ],
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
});
