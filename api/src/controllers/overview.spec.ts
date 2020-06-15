import { calculateXIRRFromTransactions, DEFAULT_INVESTMENT_RATE } from './overview';
import { Transaction } from '~api/types';

describe('Funds controller', () => {
  describe('calculateXIRRFromTransactions', () => {
    const now = new Date('2020-04-20');
    const currentValue = 9675005;
    const transactions: Transaction[] = [
      {
        date: '2016-09-21',
        units: 105,
        cost: 405562,
      },
      {
        date: '2016-10-09',
        units: -120,
        cost: -20322,
      },
      {
        date: '2017-04-30',
        units: 6500,
        cost: 16775,
      },
      {
        date: '2018-10-11',
        units: 17702,
        cost: 6007662,
      },
    ];

    it('should calculate XIRR given a current value and list of transactions', () => {
      expect.assertions(1);
      const xirr = calculateXIRRFromTransactions(now, currentValue, transactions);
      expect(xirr).toBeCloseTo(0.27625440474105967, 4);
    });

    const noPositiveCashFlow: Transaction[] = [
      {
        date: '2016-09-21',
        units: -102,
        cost: -11923,
      },
    ];

    describe.each`
      case                                | value        | testTransactions
      ${'there is no positive cash flow'} | ${undefined} | ${noPositiveCashFlow}
      ${'the current value is null'}      | ${null}      | ${undefined}
    `('if $case', ({ value = currentValue, testTransactions = transactions }) => {
      it(`should return ${DEFAULT_INVESTMENT_RATE}`, () => {
        expect.assertions(1);

        expect(calculateXIRRFromTransactions(now, value, testTransactions)).toBe(
          DEFAULT_INVESTMENT_RATE,
        );
      });
    });
  });
});
