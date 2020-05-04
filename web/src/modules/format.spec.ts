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

import { getTransactionsList } from '~client/modules/data';

describe('format module', () => {
  describe('capitalise', () => {
    it('should capitalise a word', () => {
      expect.assertions(2);
      expect(capitalise('foobar')).toBe('Foobar');
      expect(capitalise('fOoBaR')).toBe('Foobar');
    });
  });

  describe('numberFormat', () => {
    it('should add comma separators to a long number', () => {
      expect.assertions(3);
      expect(numberFormat(1000)).toBe('1,000');
      expect(numberFormat(91239.192)).toBe('91,239.192');
      expect(numberFormat(192)).toBe('192');
    });
  });

  describe('sigFigs', () => {
    it('should return strings of the expected width', () => {
      expect.assertions(3);
      expect(sigFigs(1, 3)).toBe('1.00');
      expect(sigFigs(1.55293, 3)).toBe('1.55');
      expect(sigFigs(34.9239912, 5)).toBe('34.924');
    });

    it('should handle numbers larger than the width given', () => {
      expect.assertions(1);
      expect(sigFigs(100000, 3)).toBe('100000');
    });

    it('should work for 0', () => {
      expect.assertions(2);
      expect(sigFigs(0, 2)).toBe('0.0');
      expect(sigFigs(0, 3)).toBe('0.00');
    });

    it('should work for negative numbers', () => {
      expect.assertions(1);
      expect(sigFigs(-23.10029, 6)).toBe('-23.1003');
    });

    it('should add the correct number of trailing zeroes', () => {
      expect.assertions(1);
      expect(sigFigs(54.40007, 4)).toBe('54.40');
    });
  });

  describe('leadingZeroes', () => {
    it('should add the expected number of zeroes to a number', () => {
      expect.assertions(7);
      expect(leadingZeroes(0, 3)).toBe('000');
      expect(leadingZeroes(1, 3)).toBe('001');
      expect(leadingZeroes(10, 3)).toBe('010');
      expect(leadingZeroes(11, 3)).toBe('011');
      expect(leadingZeroes(100, 3)).toBe('100');
      expect(leadingZeroes(999, 3)).toBe('999');
      expect(leadingZeroes(1313, 3)).toBe('1313');
    });
  });

  describe('formatCurrency', () => {
    it('should format a GBX value into £x.yz format by default, with commas', () => {
      expect.assertions(4);
      expect(formatCurrency(1)).toBe('£0.01');
      expect(formatCurrency(-1)).toBe('\u2212£0.01');
      expect(formatCurrency(145)).toBe('£1.45');
      expect(formatCurrency(1823123919)).toBe('£18,231,239.19');
    });

    it('should set the precision to 2 by default', () => {
      expect.assertions(1);
      expect(formatCurrency(486121.293)).toBe('£4,861.21');
    });

    it('should accept a brackets parameter', () => {
      expect.assertions(2);
      expect(
        formatCurrency(-8123, {
          brackets: true,
        }),
      ).toBe('(£81.23)');

      expect(
        formatCurrency(192, {
          brackets: true,
        }),
      ).toBe('£1.92');
    });

    it('should accept a noSymbol parameter', () => {
      expect.assertions(1);
      expect(
        formatCurrency(99123, {
          noSymbol: true,
        }),
      ).toBe('991.23');
    });

    it('should accept a noPence parameter', () => {
      expect.assertions(1);
      expect(
        formatCurrency(17493, {
          noPence: true,
        }),
      ).toBe('£175');
    });

    it('should accept a suffix parameter', () => {
      expect.assertions(1);
      expect(
        formatCurrency(7221391, {
          suffix: 'foobar',
        }),
      ).toBe('£72,213.91foobar');
    });

    it('should accept a raw parameter', () => {
      expect.assertions(1);
      expect(
        formatCurrency(8824, {
          raw: true,
        }),
      ).toBe('\u00a388.24');
    });

    describe('if abbreviating', () => {
      it('should abbreviate a value less than 1000', () => {
        expect.assertions(1);
        expect(
          formatCurrency(1000, {
            abbreviate: true,
          }),
        ).toBe('£10.00');
      });

      it('should abbreviate a value less than 1 million', () => {
        expect.assertions(1);
        expect(
          formatCurrency(191233, {
            abbreviate: true,
          }),
        ).toBe('£2k');
      });

      it('should abbreviate a value less than 1 billion', () => {
        expect.assertions(1);
        expect(
          formatCurrency(128633219, {
            abbreviate: true,
          }),
        ).toBe('£1m');
      });

      it('should abbreviate a value less than 1 trillion', () => {
        expect.assertions(1);
        expect(
          formatCurrency(7859128633219, {
            abbreviate: true,
          }),
        ).toBe('£79bn');
      });

      it('should abbreviate a value greater than 1 trillion', () => {
        expect.assertions(1);
        expect(
          formatCurrency(981123199100139, {
            abbreviate: true,
          }),
        ).toBe('£10tn');
      });

      it('should set the precision to 0 by default', () => {
        expect.assertions(1);
        expect(formatCurrency(486121.293, { abbreviate: true })).toBe('£5k');
      });

      it('should accept a precision parameter', () => {
        expect.assertions(2);
        expect(
          formatCurrency(818231238, {
            abbreviate: true,
            precision: 1,
          }),
        ).toBe('£8.2m');

        expect(
          formatCurrency(818231238, {
            abbreviate: true,
            precision: 3,
          }),
        ).toBe('£8.182m');
      });
    });
  });
});

describe('formatPercent', () => {
  it('should add a percent symbol and round', () => {
    expect.assertions(2);
    expect(formatPercent(19 / 100)).toBe('19.00%');
    expect(formatPercent(38 / 50)).toBe('76.00%');
  });
});

describe('getTickSize', () => {
  it('should get the correct tick size', () => {
    expect.assertions(5);
    expect(getTickSize(-1, 11, 10)).toBe(2);
    expect(getTickSize(0, 996, 5)).toBe(200);
    expect(getTickSize(0, 1001, 5)).toBe(500);
    expect(getTickSize(0, 99, 1)).toBe(100);
    expect(getTickSize(0, 100, 1)).toBe(100);
  });
});

describe('formatItem', () => {
  describe('dates', () => {
    it('should be formatted as locale strings', () => {
      expect.assertions(1);
      expect(formatItem('date', new Date('2019-07-14T23:19:20Z'))).toBe('14/07/2019');
    });

    it('should be formatted as empty strings if undefined', () => {
      expect.assertions(1);
      expect(formatItem('date')).toBe('');
    });
  });

  describe('dates (legacy)', () => {
    // TODO: remove this legacy compat
    it('should be formatted as locale strings', () => {
      expect.assertions(1);
      expect(formatItem('date', new Date('2019-07-14'))).toBe('14/07/2019');
    });
  });

  it('should format strings', () => {
    expect.assertions(6);
    expect(formatItem('item', 'foo')).toBe('foo');
    expect(formatItem('item', 'bar')).toBe('bar');
    expect(formatItem('category', 'baz')).toBe('baz');
    expect(formatItem('shop', 'bak')).toBe('bak');
    expect(formatItem('holiday', 'kab')).toBe('kab');
    expect(formatItem('social', 'kebab')).toBe('kebab');
  });

  describe('costs', () => {
    it('should be formatted with currency', () => {
      expect.assertions(1);
      expect(formatItem('cost', 3462)).toBe('£34.62');
    });

    it('should be formatted as empty strings if undefined', () => {
      expect.assertions(1);
      expect(formatItem('cost')).toBe('');
    });
  });

  describe('transactions', () => {
    it('should return the number of transactions as a string', () => {
      expect.assertions(1);
      expect(
        formatItem(
          'transactions',
          getTransactionsList([
            { date: '2019-05-03', units: 3, cost: 2 },
            { date: '2019-05-017', units: 31, cost: 25 },
          ]),
        ),
      ).toBe('2');
    });

    it('should return 0 if the value is undefined', () => {
      expect.assertions(1);
      expect(formatItem('transactions')).toBe('0');
    });
  });
});
