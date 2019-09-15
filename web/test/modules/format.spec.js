import test from 'ava';
import { DateTime } from 'luxon';

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

test('capitalises a word', (t) => {
    t.is(capitalise('foobar'), 'Foobar');
    t.is(capitalise('fOoBaR'), 'Foobar');
});

test('numberFormat adds comma separators', (t) => {
    t.is(numberFormat(1000), '1,000');
    t.is(numberFormat(91239.192), '91,239.192');
    t.is(numberFormat(192), '192');
});

test('sigFigs returns strings of the expected width', (t) => {
    t.is(sigFigs(1, 3), '1.00');
    t.is(sigFigs(1.55293, 3), '1.55');
    t.is(sigFigs(34.9239912, 5), '34.924');
});

test('sigFigs handles numbers larger than the width given', (t) => {
    t.is(sigFigs(100000, 3), '100000');
});

test('sigFigs works for 0', (t) => {
    t.is(sigFigs(0, 2), '0.0');
    t.is(sigFigs(0, 3), '0.00');
});

test('leadingZeroes adds the expected number of zeroes to a number', (t) => {
    t.is(leadingZeroes(0, 3), '000');
    t.is(leadingZeroes(1, 3), '001');
    t.is(leadingZeroes(10, 3), '010');
    t.is(leadingZeroes(11, 3), '011');
    t.is(leadingZeroes(100, 3), '100');
    t.is(leadingZeroes(999, 3), '999');
    t.is(leadingZeroes(1313, 3), '1313');
});

test('formatCurrency formats a GBX value into £x.yz format by default, with commas', (t) => {
    t.is(formatCurrency(1), '£0.01');
    t.is(formatCurrency(-1), '\u2212£0.01');
    t.is(formatCurrency(145), '£1.45');
    t.is(formatCurrency(1823123919), '£18,231,239.19');
});

test('formatCurrency sets the precision to 2 by default', (t) => {
    t.is(formatCurrency(486121.293), '£4,861.21');
});

test('formatCurrency sets the precision to 0 by default, if abbreviats', (t) => {
    t.is(formatCurrency(486121.293, { abbreviate: true }), '£5k');
});

test('formatCurrency accepts an abbreviate parameter', (t) => {
    t.is(formatCurrency(1000, {
        abbreviate: true,
    }), '£10.00');

    t.is(formatCurrency(191233, {
        abbreviate: true,
    }), '£2k');

    t.is(formatCurrency(128633219, {
        abbreviate: true,
    }), '£1m');

    t.is(formatCurrency(7859128633219, {
        abbreviate: true,
    }), '£79bn');

    t.is(formatCurrency(981123199100139, {
        abbreviate: true,
    }), '£10tn');
});

test('formatCurrency accepts a precision parameter with abbreviate', (t) => {
    t.is(formatCurrency(818231238, {
        abbreviate: true,
        precision: 1,
    }), '£8.2m');

    t.is(formatCurrency(818231238, {
        abbreviate: true,
        precision: 3,
    }), '£8.182m');
});

test('formatCurrency accepts a brackets parameter', (t) => {
    t.is(formatCurrency(-8123, {
        brackets: true,
    }), '(£81.23)');

    t.is(formatCurrency(192, {
        brackets: true,
    }), '£1.92');
});

test('formatCurrency accepts a noSymbol parameter', (t) => {
    t.is(formatCurrency(99123, {
        noSymbol: true,
    }), '991.23');
});

test('formatCurrency accepts a noPence parameter', (t) => {
    t.is(formatCurrency(17493, {
        noPence: true,
    }), '£175');
});

test('formatCurrency accepts a suffix parameter', (t) => {
    t.is(formatCurrency(7221391, {
        suffix: 'foobar',
    }), '£72,213.91foobar');
});

test('formatCurrency accepts a raw parameter', (t) => {
    t.is(formatCurrency(8824, {
        raw: true,
    }), '\u00a388.24');
});

test('formatPercent adds a percent symbol and rounds', (t) => {
    t.is(formatPercent(19 / 100), '19.00%');
    t.is(formatPercent(38 / 50), '76.00%');
});

test('getTickSize gets the correct tick size', (t) => {
    t.is(getTickSize(-1, 11, 10), 2);
    t.is(getTickSize(0, 996, 5), 200);
    t.is(getTickSize(0, 1001, 5), 500);
});

test('formatItem formats dates', (t) => {
    const date = DateTime.fromISO('2019-07-14T23:19:20Z');
    t.is(formatItem('date', date), date.toLocaleString(DateTime.DATE_SHORT));
});

test('formatItem formats strings', (t) => {
    t.is(formatItem('item', 'foo'), 'foo');
    t.is(formatItem('category', 'bar'), 'bar');
    t.is(formatItem('shop', 'baz'), 'baz');
    t.is(formatItem('holiday', 'bak'), 'bak');
    t.is(formatItem('social', 'kab'), 'kab');
});

test('formatItem formats costs', (t) => {
    t.is(formatItem('cost', 3462), formatCurrency(3462));
});

test('formatItem formats transactions lists', (t) => {
    t.is(formatItem('transactions', getTransactionsList([
        { date: '2019-05-03', units: 3, cost: 2 },
        { date: '2019-05-017', units: 31, cost: 25 },
    ])), '2');
});
