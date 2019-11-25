import test from 'ava';
import memoize from 'fast-memoize';
import { render } from '@testing-library/react';
import '~client-test/browser';
import React from 'react';
import ListRowFundsMobile from '~client/components/ListRowFundsMobile';
import { getTransactionsList } from '~client/modules/data';

test('renders nothing if there is no gain', t => {
    const item = {
        item: 'some fund',
        transactions: [],
        gain: null,
    };
    const { container } = render(<ListRowFundsMobile item={item} />);

    t.is(container.childNodes.length, 0);
});

const getContainer = memoize((process = item => item) => {
    const item = process({
        gain: {
            value: 9931,
        },
        item: 'some fund',
        transactions: getTransactionsList([
            { date: '2019-06-23', units: 44.31, cost: 1092397 },
        ]),
    });

    return render(<ListRowFundsMobile item={item} />);
});

test('renders a main container', t => {
    const { container } = getContainer();

    t.is(container.childNodes.length, 1);
    const [span] = container.childNodes;

    t.is(span.tagName, 'SPAN');
    t.is(span.childNodes.length, 2);
});

test('renders a cost value', t => {
    const { container } = getContainer();
    const {
        childNodes: [costValue],
    } = container.childNodes[0];

    t.is(costValue.tagName, 'SPAN');
    t.is(costValue.innerHTML, '£10.9k');
});

test('renders an actual value', t => {
    const { container } = getContainer();
    const {
        childNodes: [, actualValue],
    } = container.childNodes[0];

    t.is(actualValue.tagName, 'SPAN');
    t.is(actualValue.innerHTML, '£99.31');
});

test('renders a dash if the fund is sold', t => {
    const { container } = getContainer(item => ({
        ...item,
        transactions: getTransactionsList([
            { date: '2019-06-23', units: 44.31, cost: 1092397 },
            { date: '2019-07-31', units: -44.31, cost: -1131032 },
        ]),
    }));

    const {
        childNodes: [, actualValue],
    } = container.childNodes[0];

    t.is(actualValue.innerHTML, '\u2013');
});
