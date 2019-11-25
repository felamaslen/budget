import ava from 'ava';
import sinon from 'sinon';
import ninos from 'ninos';

import memoize from 'fast-memoize';
import '~client-test/browser';
import { render, fireEvent } from '@testing-library/react';
import React from 'react';
import SubTree from '~client/containers/PageAnalysis/sub-tree';

const test = ninos(ava);

const getContainer = memoize((customProps = {}) => {
    const props = {
        open: true,
        subTree: [
            { name: 'foo1', total: 2 },
            { name: 'foo2', total: 4 },
        ],
        name: 'foo',
        itemCost: 6,
        onHover: () => null,
        ...customProps,
    };

    return render(<SubTree {...props} />);
});

test('basic structure', (t) => {
    const { container } = getContainer();

    t.is(container.childNodes.length, 1);
    const [ul] = container.childNodes;
    t.is(ul.tagName, 'UL');
    t.is(ul.childNodes.length, 2);
});

test('rendering each sub tree item', (t) => {
    const { container } = getContainer();
    const [ul] = container.childNodes;

    const items = [
        { name: 'foo1', cost: '0.02', pct: '33.3' },
        { name: 'foo2', cost: '0.04', pct: '66.7' },
    ];

    items.forEach(({ name, cost, pct }, index) => {
        const child = ul.childNodes[index];

        t.is(child.tagName, 'LI');
        t.is(child.childNodes.length, 1);

        const [main] = child.childNodes;
        t.is(main.tagName, 'DIV');
        t.is(main.childNodes.length, 3);

        const [titleItem, costItem, pctItem] = main.childNodes;

        t.is(titleItem.tagName, 'SPAN');
        t.is(titleItem.innerHTML, name);

        t.is(costItem.tagName, 'SPAN');
        t.is(costItem.innerHTML, `£${cost}`);

        t.is(pctItem.tagName, 'SPAN');
        t.is(pctItem.innerHTML, ` (${pct}%)`);
    });
});

test('onHover', (t) => {
    const onHover = sinon.spy();

    const { container } = getContainer({
        onHover,
    });

    t.is(onHover.getCalls().length, 0);

    fireEvent.mouseOver(container.childNodes[0].childNodes[0]);
    t.is(onHover.getCalls().length, 1);
    t.deepEqual(onHover.getCalls()[0].args, ['foo', 'foo1']);

    fireEvent.mouseOver(container.childNodes[0].childNodes[1]);
    t.is(onHover.getCalls().length, 2);
    t.deepEqual(onHover.getCalls()[1].args, ['foo', 'foo2']);
});

test('not rendering anything if not open', (t) => {
    const { container } = getContainer({
        open: false,
    });

    t.is(container.childNodes.length, 0);
});

test('not rendering anything if there is no subtree', (t) => {
    const { container } = getContainer({
        subTree: null,
    });

    t.is(container.childNodes.length, 0);
});
