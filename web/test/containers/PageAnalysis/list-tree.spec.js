import test from 'ava';
import '~client-test/browser';
import { fromJS } from 'immutable';
import { render, fireEvent } from 'react-testing-library';
import { createMockStore } from 'redux-test-utils';
import { Provider } from 'react-redux';
import React from 'react';
import ListTree from '~client/containers/PageAnalysis/list-tree';
import {
    aTreeItemExpandToggled,
    aTreeItemDisplayToggled,
    aTreeItemHovered
} from '~client/actions/analysis.actions';

const getContainer = (customProps = {}, customState = null) => {
    let state = fromJS({
        pages: {
            analysis: {
                cost: [
                    { name: 'foo1', total: 1, subTree: [{ name: 'bar1', total: 1 }] },
                    { name: 'foo2', total: 4, subTree: [{ name: 'bar2', total: 2 }] },
                    { name: 'foo3', total: 3, subTree: [{ name: 'bar3', total: 2 }] },
                    { name: 'foo4', total: 6, subTree: [{ name: 'bar4', total: 2 }] },
                    { name: 'foo5', total: 10, subTree: [{ name: 'bar5', total: 3 }] }
                ],
                costTotal: 24
            }
        },
        other: {
            analysis: {
                treeVisible: {
                    foo1: true,
                    foo2: false,
                    foo3: true
                },
                treeOpen: {
                    foo1: true,
                    foo2: false,
                    foo3: false,
                    foo4: true
                }
            }
        }
    });

    if (customState) {
        state = customState(state);
    }

    const store = createMockStore(state);

    const props = {
        ...customProps
    };

    const utils = render(
        <Provider store={store}>
            <ListTree {...props} />
        </Provider>
    );

    return { store, ...utils };
};

test('basic structure', t => {
    const { container } = getContainer();

    t.is(container.childNodes.length, 1);

    const [div] = container.childNodes;
    t.is(div.tagName, 'DIV');
    t.is(div.className, 'tree');
    t.is(div.childNodes.length, 1);

    const [ul] = div.childNodes;
    t.is(ul.tagName, 'UL');
    t.is(ul.className, 'tree-list');
    t.is(ul.childNodes.length, 6);
});

test('list tree head', t => {
    const { container } = getContainer();
    const [div] = container.childNodes;
    const [ul] = div.childNodes;
    const [head] = ul.childNodes;

    t.is(head.tagName, 'LI');
    t.is(head.className, 'tree-list-item head');
});

const bodyTestCases = [
    { name: 'foo1', visible: true, open: true, cost: '0.01', pct: '4.2' },
    { name: 'foo2', visible: false, open: false, cost: '0.04', pct: '16.7' },
    { name: 'foo3', visible: true, open: false, cost: '0.03', pct: '12.5' },
    { name: 'foo4', visible: true, open: true, cost: '0.06', pct: '25.0' },
    { name: 'foo5', visible: true, open: false, cost: '0.10', pct: '41.7' }
];

test('list tree body - basic structure', t => {
    const { container } = getContainer();

    const [div] = container.childNodes;
    const [ul] = div.childNodes;

    bodyTestCases.forEach(({ name, open }, index) => {
        const child = ul.childNodes[index + 1];

        t.is(child.tagName, 'LI');
        t.regex(child.className, new RegExp(`tree-list-item ${name}`));

        if (open) {
            t.regex(child.className, /open/);
            t.is(child.childNodes.length, 2);
        } else {
            t.notRegex(child.className, /open/);
            t.is(child.childNodes.length, 1);
        }
    });
});

test('list tree body - main', t => {
    const { container } = getContainer();

    const [div] = container.childNodes;
    const [ul] = div.childNodes;

    bodyTestCases.forEach(({ name, visible, cost, pct }, index) => {
        const child = ul.childNodes[index + 1];

        const [main] = child.childNodes;

        t.is(main.tagName, 'DIV');
        t.is(main.className, 'main');
        t.is(main.childNodes.length, 5);

        const [indicator, input, title, costItem, pctItem] = main.childNodes;

        t.is(indicator.tagName, 'SPAN');
        t.is(indicator.className, 'indicator');

        t.is(input.tagName, 'INPUT');
        t.is(input.type, 'checkbox');
        t.is(input.checked, visible);

        t.is(title.tagName, 'SPAN');
        t.is(title.className, 'title');
        t.is(title.innerHTML, name);

        t.is(costItem.tagName, 'SPAN');
        t.is(costItem.className, 'cost');
        t.is(costItem.innerHTML, `£${cost}`);

        t.is(pctItem.tagName, 'SPAN');
        t.is(pctItem.className, 'pct');
        t.is(pctItem.innerHTML, ` (${pct}%)`);
    });
});

test('list tree body - sub tree', t => {
    const { container } = getContainer();

    const [div] = container.childNodes;
    const [ul] = div.childNodes;

    bodyTestCases.forEach(({ open }, index) => {
        if (!open) {
            return;
        }

        const child = ul.childNodes[index + 1];

        const [, subTree] = child.childNodes;

        t.is(subTree.tagName, 'UL');
        t.is(subTree.className, 'sub-tree');
    });
});

test('expanding items on click', t => {
    const { store, container } = getContainer();

    const [div] = container.childNodes;
    const [ul] = div.childNodes;

    bodyTestCases.forEach(({ name }, index) => {
        const child = ul.childNodes[index + 1];
        const [main] = child.childNodes;

        const action = aTreeItemExpandToggled(name);

        t.false(store.isActionDispatched(action));

        fireEvent.click(main);

        t.true(store.isActionDispatched(action));
    });
});

test('hovering over items', t => {
    bodyTestCases.forEach(({ name }, index) => {
        const { store, container } = getContainer();

        const [div] = container.childNodes;
        const [ul] = div.childNodes;

        const child = ul.childNodes[index + 1];
        const [main] = child.childNodes;

        const actionIn = aTreeItemHovered([name]);

        t.false(store.isActionDispatched(actionIn));
        fireEvent.mouseOver(main);
        t.true(store.isActionDispatched(actionIn));

        const actionOut = aTreeItemHovered(null);

        t.false(store.isActionDispatched(actionOut));
        fireEvent.mouseOut(main);
        t.true(store.isActionDispatched(actionOut));
    });
});

test('toggling items by the tick box', t => {
    const { store, container } = getContainer();

    const [div] = container.childNodes;
    const [ul] = div.childNodes;

    bodyTestCases.forEach(({ name }, index) => {
        const child = ul.childNodes[index + 1];
        const [main] = child.childNodes;
        const [, input] = main.childNodes;

        const action = aTreeItemDisplayToggled(name);

        t.false(store.isActionDispatched(action));
        fireEvent.click(input);
        t.true(store.isActionDispatched(action));
    });
});

