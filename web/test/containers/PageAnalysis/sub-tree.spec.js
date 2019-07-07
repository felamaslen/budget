import ava from 'ava';
import ninos from 'ninos';
const test = ninos(ava);

import memoize from 'fast-memoize';
import '~client-test/browser';
import { render } from '@testing-library/react';
import React from 'react';
import SubTree from '~client/containers/PageAnalysis/sub-tree';

const getContainer = memoize((customProps = {}) => {
    const props = {
        open: true,
        subTree: [
            { name: 'foo1', total: 2 },
            { name: 'foo2', total: 4 }
        ],
        name: 'foo',
        itemCost: 6,
        onHover: () => null,
        ...customProps
    };

    return render(<SubTree {...props} />);
});

test('basic structure', t => {
    const { container } = getContainer();

    t.is(container.childNodes.length, 1);
    const [ul] = container.childNodes;
    t.is(ul.tagName, 'UL');
    t.is(ul.className, 'sub-tree');
    t.is(ul.childNodes.length, 2);
});

test('rendering each sub tree item', t => {
    const { container } = getContainer();
    const [ul] = container.childNodes;

    const items = [
        { name: 'foo1', cost: '0.02', pct: '33.3' },
        { name: 'foo2', cost: '0.04', pct: '66.7' }
    ];

    items.forEach(({ name, cost, pct }, index) => {
        const child = ul.childNodes[index];

        t.is(child.tagName, 'LI');
        t.is(child.className, 'tree-list-item');
        t.is(child.childNodes.length, 1);

        const [main] = child.childNodes;
        t.is(main.tagName, 'DIV');
        t.is(main.className, 'main');
        t.is(main.childNodes.length, 3);

        const [titleItem, costItem, pctItem] = main.childNodes;

        t.is(titleItem.tagName, 'SPAN');
        t.is(titleItem.className, 'title');
        t.is(titleItem.innerHTML, name);

        t.is(costItem.tagName, 'SPAN');
        t.is(costItem.className, 'cost');
        t.is(costItem.innerHTML, `£${cost}`);

        t.is(pctItem.tagName, 'SPAN');
        t.is(pctItem.className, 'pct');
        t.is(pctItem.innerHTML, ` (${pct}%)`);
    });
});

test('not rendering anything if not open', t => {
    const { container } = getContainer({
        open: false
    });

    t.is(container.childNodes.length, 0);
});

test('not rendering anything if there is no subtree', t => {
    const { container } = getContainer({
        subTree: null
    });

    t.is(container.childNodes.length, 0);
});
