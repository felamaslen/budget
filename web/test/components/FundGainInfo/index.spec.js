import test from 'ava';
import memoize from 'fast-memoize';
import compose from 'just-compose';
import '~client-test/browser';
import { render } from '@testing-library/react';
import React from 'react';
import FundGainInfo from '~client/components/FundGainInfo';

const getGainInfo = memoize((customProps = {}) => {
    const props = {
        gain: {
            value: 561932,
            gain: 0.3,
            gainAbs: 4030,
            dayGain: -0.02,
            dayGainAbs: -341,
            color: [255, 128, 30],
        },
        ...customProps,
    };

    return render(<FundGainInfo {...props} />);
});

test('gain info', t => {
    const { container } = getGainInfo();

    t.is(container.childNodes.length, 1);
    const [outer] = container.childNodes;
    t.is(outer.tagName, 'SPAN');
    t.is(outer.childNodes.length, 1);

    const [inner] = outer.childNodes;
    t.is(inner.tagName, 'SPAN');
    t.is(inner.childNodes.length, 2);
});

const getInner = compose(
    getGainInfo,
    ({ container }) => container.childNodes[0].childNodes[0],
);

test('current value', t => {
    const inner = getInner();
    const [value] = inner.childNodes;

    t.is(value.tagName, 'SPAN');
    t.is(value.innerHTML, '£5.6k');
});

test('breakdown', t => {
    const inner = getInner();
    const [, breakdown] = inner.childNodes;

    t.is(breakdown.tagName, 'SPAN');
    t.is(breakdown.childNodes.length, 2);
});

const getBreakdown = compose(
    getInner,
    inner => inner.childNodes[1],
);

test('overall gain', t => {
    const breakdown = getBreakdown();

    const [overall] = breakdown.childNodes;

    t.is(overall.tagName, 'SPAN');
    t.is(overall.childNodes.length, 2);
});

const getOverall = compose(
    getBreakdown,
    breakdown => breakdown.childNodes[0],
);

test('(overall) absolute value', t => {
    const overall = getOverall();

    const [absolute] = overall.childNodes;

    t.is(absolute.tagName, 'SPAN');
    t.is(absolute.innerHTML, '£40');
});

test('(overall) relative value', t => {
    const overall = getOverall();

    const [, relative] = overall.childNodes;

    t.is(relative.tagName, 'SPAN');
    t.is(relative.innerHTML, '30.00%');
});

test('daily gain', t => {
    const breakdown = getBreakdown();

    const [, daily] = breakdown.childNodes;

    t.is(daily.tagName, 'SPAN');
    t.is(daily.childNodes.length, 2);
});

const getDaily = compose(
    getBreakdown,
    breakdown => breakdown.childNodes[1],
);

test('(daily) absolute value', t => {
    const daily = getDaily();

    const [absolute] = daily.childNodes;

    t.is(absolute.tagName, 'SPAN');
    t.is(absolute.innerHTML, '(£3)');
});

test('(daily) relative value', t => {
    const daily = getDaily();

    const [, relative] = daily.childNodes;

    t.is(relative.tagName, 'SPAN');
    t.is(relative.innerHTML, '(2.00%)');
});
