import { calculateXIRRFromTransactions, DEFAULT_INVESTMENT_RATE } from './overview';
import { Transaction } from '~api/types';

describe('Funds controller', () => {
  describe('calculateXIRRFromTransactions', () => {
    const now = new Date('2020-04-20');
    const currentValue = 9675005;
    const transactions: Transaction[] = [
      {
        date: new Date(new Date('2016-09-21')),
        units: 105,
        price: 3860.2,
        fees: 230,
        taxes: 11,
        drip: false,
        pension: false,
      },
      {
        date: new Date('2016-10-09'),
        units: -120,
        price: 170.5,
        fees: 138,
        taxes: 0,
        drip: false,
        pension: false,
      },
      {
        date: new Date('2017-04-30'),
        units: 6500,
        price: 2.55,
        fees: 150,
        taxes: 50,
        drip: false,
        pension: false,
      },
      {
        date: new Date('2018-10-11'),
        units: 17702,
        price: 337.5,
        fees: 237,
        taxes: 33000,
        drip: false,
        pension: false,
      },
    ];

    it('should calculate XIRR given a current value and list of transactions', () => {
      expect.assertions(1);
      const xirr = calculateXIRRFromTransactions(now, currentValue, transactions);
      expect(xirr).toBeCloseTo(0.27625440474105967, 4);
    });

    describe('when a transaction is a DRIP (dividend reinvestment plan)', () => {
      it('should disregard the unit price paid when determining the cost', () => {
        expect.assertions(1);
        expect(
          calculateXIRRFromTransactions(now, currentValue, [
            ...transactions,
            {
              date: new Date('2017-11-25'),
              units: 165,
              price: 195.4,
              fees: 185,
              taxes: 43,
              drip: true,
              pension: false,
            },
          ]),
        ).toBe(
          calculateXIRRFromTransactions(now, currentValue, [
            ...transactions,
            {
              date: new Date('2017-11-25'),
              units: 0,
              price: 0,
              fees: 185,
              taxes: 43,
              drip: true,
              pension: false,
            },
          ]),
        );
      });
    });

    const noPositiveCashFlow: Transaction[] = [
      {
        date: new Date('2016-09-21'),
        units: -102,
        price: 117,
        fees: 5,
        taxes: 6,
        drip: false,
        pension: false,
      },
    ];

    describe.each`
      case                                | value        | testTransactions
      ${'there is no positive cash flow'} | ${undefined} | ${noPositiveCashFlow}
      ${'the current value is null'}      | ${null}      | ${undefined}
    `('if $case', ({ value = currentValue, testTransactions = transactions }) => {
      it(`should return the assumed XIRR of ${DEFAULT_INVESTMENT_RATE}`, () => {
        expect.assertions(1);

        expect(calculateXIRRFromTransactions(now, value, testTransactions)).toBe(
          DEFAULT_INVESTMENT_RATE,
        );
      });
    });

    describe('when the series diverges', () => {
      it('should not return NaN', () => {
        expect.assertions(2);
        const result = calculateXIRRFromTransactions(new Date('2020-04-26T13:20:03.000Z'), 4702, [
          {
            date: new Date('2016-08-24'),
            units: 89.095,
            price: 1122.3,
            fees: 8,
            taxes: 0,
            drip: false,
            pension: false,
          },
          {
            date: new Date('2016-09-19'),
            units: 1678.42,
            price: 119.15,
            fees: 16,
            taxes: 0,
            drip: false,
            pension: false,
          },
          {
            date: new Date('2016-09-19'),
            units: 894.134,
            price: 111.84,
            fees: 0,
            taxes: 0,
            drip: false,
            pension: false,
          },
          {
            date: new Date('2017-02-14'),
            units: 846.38,
            price: 118.15,
            fees: 0,
            taxes: 0,
            drip: false,
            pension: false,
          },
          {
            date: new Date('2017-04-27'),
            units: -883.229,
            price: 101.898,
            fees: 0,
            taxes: 0,
            drip: false,
            pension: false,
          },
          {
            date: new Date('2020-04-20'),
            units: 69,
            price: 949.35,
            fees: 1199,
            taxes: 1776,
            drip: false,
            pension: false,
          },
        ]);
        expect(result).not.toBeNaN();
        expect(result).toBe(DEFAULT_INVESTMENT_RATE);
      });
    });
  });
});
