import {
  capitalise,
  numberFormat,
  sigFigs,
  leadingZeroes,
  formatCurrency,
  formatPercent,
  getTickSize,
  formatItem,
} from '~client/modules/format';

import { Transaction } from '~client/types/funds';
import { getTransactionsList } from '~client/modules/data';

describe('format module', () => {
  describe('capitalise', () => {
    it('should capitalise a word', () => {
      expect(capitalise('foobar')).toEqual('Foobar');
      expect(capitalise('fOoBaR')).toEqual('Foobar');
    });
  });

  describe('numberFormat', () => {
    it('should add comma separators to a long number', () => {
      expect(numberFormat(1000)).toEqual('1,000');
      expect(numberFormat(91239.192)).toEqual('91,239.192');
      expect(numberFormat(192)).toEqual('192');
    });
  });

  describe('sigFigs', () => {
    it('should return strings of the expected width', () => {
      expect(sigFigs(1, 3)).toEqual('1.00');
      expect(sigFigs(1.55293, 3)).toEqual('1.55');
      expect(sigFigs(34.9239912, 5)).toEqual('34.924');
    });

    it('should handle numbers larger than the width given', () => {
      expect(sigFigs(100000, 3)).toEqual('100000');
    });

    it('should work for 0', () => {
      expect(sigFigs(0, 2)).toEqual('0.0');
      expect(sigFigs(0, 3)).toEqual('0.00');
    });
  });

  describe('leadingZeroes', () => {
    it('should add the expected number of zeroes to a number', () => {
      expect(leadingZeroes(0, 3)).toEqual('000');
      expect(leadingZeroes(1, 3)).toEqual('001');
      expect(leadingZeroes(10, 3)).toEqual('010');
      expect(leadingZeroes(11, 3)).toEqual('011');
      expect(leadingZeroes(100, 3)).toEqual('100');
      expect(leadingZeroes(999, 3)).toEqual('999');
      expect(leadingZeroes(1313, 3)).toEqual('1313');
    });
  });

  describe('formatCurrency', () => {
    it('should format a GBX value into £x.yz format by default, with commas', () => {
      expect(formatCurrency(1)).toEqual('£0.01');
      expect(formatCurrency(-1)).toEqual('\u2212£0.01');
      expect(formatCurrency(145)).toEqual('£1.45');
      expect(formatCurrency(1823123919)).toEqual('£18,231,239.19');
    });

    it('should set the precision to 2 by default', () => {
      expect(formatCurrency(486121.293)).toEqual('£4,861.21');
    });

    it('should accept a brackets parameter', () => {
      expect(
        formatCurrency(-8123, {
          brackets: true,
        }),
      ).toEqual('(£81.23)');

      expect(
        formatCurrency(192, {
          brackets: true,
        }),
      ).toEqual('£1.92');
    });

    it('should accept a noSymbol parameter', () => {
      expect(
        formatCurrency(99123, {
          noSymbol: true,
        }),
      ).toEqual('991.23');
    });

    it('should accept a noPence parameter', () => {
      expect(
        formatCurrency(17493, {
          noPence: true,
        }),
      ).toEqual('£175');
    });

    it('should accept a suffix parameter', () => {
      expect(
        formatCurrency(7221391, {
          suffix: 'foobar',
        }),
      ).toEqual('£72,213.91foobar');
    });

    it('should accept a raw parameter', () => {
      expect(
        formatCurrency(8824, {
          raw: true,
        }),
      ).toEqual('\u00a388.24');
    });

    describe('if abbreviating', () => {
      it('should abbreviate a value less than 1000', () => {
        expect(
          formatCurrency(1000, {
            abbreviate: true,
          }),
        ).toEqual('£10.00');
      });

      it('should abbreviate a value less than 1 million', () => {
        expect(
          formatCurrency(191233, {
            abbreviate: true,
          }),
        ).toEqual('£2k');
      });

      it('should abbreviate a value less than 1 billion', () => {
        expect(
          formatCurrency(128633219, {
            abbreviate: true,
          }),
        ).toEqual('£1m');
      });

      it('should abbreviate a value less than 1 trillion', () => {
        expect(
          formatCurrency(7859128633219, {
            abbreviate: true,
          }),
        ).toEqual('£79bn');
      });

      it('should abbreviate a value greater than 1 trillion', () => {
        expect(
          formatCurrency(981123199100139, {
            abbreviate: true,
          }),
        ).toEqual('£10tn');
      });

      it('should set the precision to 0 by default', () => {
        expect(formatCurrency(486121.293, { abbreviate: true })).toEqual('£5k');
      });

      it('should accept a precision parameter', () => {
        expect(
          formatCurrency(818231238, {
            abbreviate: true,
            precision: 1,
          }),
        ).toEqual('£8.2m');

        expect(
          formatCurrency(818231238, {
            abbreviate: true,
            precision: 3,
          }),
        ).toEqual('£8.182m');
      });
    });
  });
});

describe('formatPercent', () => {
  it('should add a percent symbol and round', () => {
    expect(formatPercent(19 / 100)).toEqual('19.00%');
    expect(formatPercent(38 / 50)).toEqual('76.00%');
  });
});

describe('getTickSize', () => {
  it('should get the correct tick size', () => {
    expect(getTickSize(-1, 11, 10)).toEqual(2);
    expect(getTickSize(0, 996, 5)).toEqual(200);
    expect(getTickSize(0, 1001, 5)).toEqual(500);
  });
});

describe('formatItem', () => {
  describe('dates', () => {
    it('should be formatted as locale strings', () => {
      expect(formatItem<Date>('date', new Date('2019-07-14T23:19:20Z'))).toEqual('14/07/2019');
    });

    it('should be formatted as empty strings if undefined', () => {
      expect(formatItem<Date>('date')).toEqual('');
    });
  });

  it('should format strings', () => {
    expect(formatItem<string>('item', 'foo')).toEqual('foo');
    expect(formatItem('item', 'bar')).toEqual('bar');
    expect(formatItem('category', 'baz')).toEqual('baz');
    expect(formatItem('shop', 'bak')).toEqual('bak');
    expect(formatItem('holiday', 'kab')).toEqual('kab');
    expect(formatItem('social', 'kebab')).toEqual('kebab');
  });

  describe('costs', () => {
    it('should be formatted with currency', () => {
      expect(formatItem<number>('cost', 3462)).toEqual('£34.62');
    });

    it('should be formatted as empty strings if undefined', () => {
      expect(formatItem<number>('cost')).toEqual('');
    });
  });

  describe('transactions', () => {
    it('should return the number of transactions as a string', () => {
      expect(
        formatItem<Transaction[]>(
          'transactions',
          getTransactionsList([
            { date: '2019-05-03', units: 3, cost: 2 },
            { date: '2019-05-017', units: 31, cost: 25 },
          ]),
        ),
      ).toEqual('2');
    });

    it('should return 0 if the value is undefined', () => {
      expect(formatItem<Transaction[]>('transactions')).toEqual('0');
    });
  });
});
