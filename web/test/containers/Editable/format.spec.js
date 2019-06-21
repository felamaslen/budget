import test from 'ava';
import '~client-test/browser';
import { render } from 'react-testing-library';
import { DateTime } from 'luxon';
import {
    getEditValue,
    formatValue,
    getDefaultValue
} from '~client/containers/Editable/format';
import { dateInput } from '~client/modules/date';

test('getEditValue / dates / trying to make a date from the raw value', t => {
    t.deepEqual(getEditValue('date', 'foo', '10/11/2017'), dateInput('10/11/2017'));

    t.deepEqual(getEditValue('date', 'foo', '10/11/17'), dateInput('10/11/17'));
});

test('getEditValue / dates / returning the original value if it can\'t get a valid date', t => {
    t.is(getEditValue('date', 'foo', 'not a date'), 'foo');
});

test('getEditValue / costs / returning the raw value in pence', t => {
    t.is(getEditValue('cost', 103, '106.34'), 10634);
});

test('getEditValue / costs / returning 0 for invalid values', t => {
    t.is(getEditValue('cost', 103, 'not a number'), 0);
    t.is(getEditValue('cost', 103, NaN), 0);
});

test('getEditValue / transactions / returning null', t => {
    t.is(getEditValue('transactions', 'foo', 'bar'), null);
});

test('getEditValue / returning the raw value as a string by default', t => {
    t.is(getEditValue('text', 'foo', 'bar'), 'bar');
    t.is(getEditValue('text', 'foo', 100), '100');
});

test('formatValue / dates / returning the formatted date', t => {
    t.is(formatValue('date', dateInput('10/11/2017')), DateTime.fromISO('2017-11-10').toLocaleString(DateTime.DATE_SHORT));
});

test('formatValue / dates / returning an empty string for invalid values', t => {
    t.is(formatValue('date', null), '');
});

test('formatValue / costs / returning the formatted value with currency', t => {
    t.is(formatValue('cost', 103), '£1.03');
});

test('formatValue / transactions / returning a <span /> with the number of transactions', t => {
    const { container } = render(formatValue('transactions', { size: 5 }));

    t.is(container.childNodes.length, 1);
    const [span] = container.childNodes;
    t.is(span.tagName, 'SPAN');
    t.is(span.className, 'num-transactions');
    t.is(span.innerHTML, '5');
});

test('formatValue / transactions / displaying 0 for bad values', t => {
    const { container } = render(formatValue('transactions', null));

    t.is(container.childNodes.length, 1);
    const [span] = container.childNodes;
    t.is(span.tagName, 'SPAN');
    t.is(span.className, 'num-transactions');
    t.is(span.innerHTML, '0');
});

test('formatValue / returning the value as a string by default', t => {
    t.is(formatValue('text', 'foo'), 'foo');
    t.is(formatValue('text', 100), '100');
});

test('getDefaultValue / dates / returning the formatted date', t => {
    t.is(getDefaultValue('date', dateInput('10/11/2017')), DateTime.fromISO('2017-11-10').toLocaleString(DateTime.DATE_SHORT));
});

test('getDefaultValue / costs / returning the GBP value if it is non-zero', t => {
    t.is(getDefaultValue('cost', 103), '1.03');
});

test('getDefaultValue / costs / returning an empty string if it is zero', t => {
    t.is(getDefaultValue('cost', 0), '');
});

test('getDefaultValue / returning the value as a string by default', t => {
    t.is(getDefaultValue('text', 'foo'), 'foo');
    t.is(getDefaultValue('text', 100), '100');
});

