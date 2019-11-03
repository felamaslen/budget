import test from 'ava';
import sinon from 'sinon';
import '~client-test/browser';
import { render, fireEvent } from '@testing-library/react';
import React from 'react';
import ListTree from '~client/containers/PageAnalysis/list-tree';

const treeVisible = {
    foo1: true,
    foo2: false,
    foo3: true,
};

const treeOpen = {
    foo1: true,
    foo2: false,
    foo3: false,
    foo4: true,
};

const getContainer = (customProps = {}) => {
    const props = {
        cost: [
            { name: 'foo1', total: 1, subTree: [{ name: 'bar1', total: 1 }] },
            { name: 'foo2', total: 4, subTree: [{ name: 'bar2', total: 2 }] },
            { name: 'foo3', total: 3, subTree: [{ name: 'bar3', total: 2 }] },
            { name: 'foo4', total: 6, subTree: [{ name: 'bar4', total: 2 }] },
            { name: 'foo5', total: 10, subTree: [{ name: 'bar5', total: 3 }] },
        ],
        treeVisible,
        treeOpen,
        toggleTreeItem: () => null,
        setTreeOpen: () => null,
        onHover: () => null,
        ...customProps,
    };

    return render(<ListTree {...props} />);
};

test('basic structure', (t) => {
    const { container } = getContainer();

    t.is(container.childNodes.length, 1);

    const [div] = container.childNodes;
    t.is(div.tagName, 'DIV');
    t.is(div.childNodes.length, 1);

    const [ul] = div.childNodes;
    t.is(ul.tagName, 'UL');
    t.is(ul.childNodes.length, 6);
});

test('list tree head', (t) => {
    const { container } = getContainer();
    const [div] = container.childNodes;
    const [ul] = div.childNodes;
    const [head] = ul.childNodes;

    t.is(head.tagName, 'LI');
});

const bodyTestCases = [
    {
        name: 'foo1', visible: true, open: true, cost: '0.01', pct: '4.2',
    },
    {
        name: 'foo2', visible: false, open: false, cost: '0.04', pct: '16.7',
    },
    {
        name: 'foo3', visible: true, open: false, cost: '0.03', pct: '12.5',
    },
    {
        name: 'foo4', visible: true, open: true, cost: '0.06', pct: '25.0',
    },
    {
        name: 'foo5', visible: true, open: false, cost: '0.10', pct: '41.7',
    },
];

test('list tree body - basic structure', (t) => {
    const { container } = getContainer();

    const [div] = container.childNodes;
    const [ul] = div.childNodes;

    bodyTestCases.forEach(({ name, open }, index) => {
        const child = ul.childNodes[index + 1];

        t.is(child.tagName, 'LI');

        if (open) {
            t.is(child.childNodes.length, 2);
        } else {
            t.is(child.childNodes.length, 1);
        }
    });
});

test('list tree body - main', (t) => {
    const { container } = getContainer();

    const [div] = container.childNodes;
    const [ul] = div.childNodes;

    bodyTestCases.forEach(({
        name, visible, cost, pct,
    }, index) => {
        const child = ul.childNodes[index + 1];

        const [main] = child.childNodes;

        t.is(main.tagName, 'DIV');
        t.is(main.childNodes.length, 5);

        const [indicator, input, title, costItem, pctItem] = main.childNodes;

        t.is(indicator.tagName, 'SPAN');

        t.is(input.tagName, 'INPUT');
        t.is(input.type, 'checkbox');
        t.is(input.checked, visible);

        t.is(title.tagName, 'SPAN');
        t.is(title.innerHTML, name);

        t.is(costItem.tagName, 'SPAN');
        t.is(costItem.innerHTML, `£${cost}`);

        t.is(pctItem.tagName, 'SPAN');
        t.is(pctItem.innerHTML, ` (${pct}%)`);
    });
});

test('list tree body - sub tree', (t) => {
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
    });
});

const testToggler = (t, toggler, name) => {
    t.not(name, 'somethingElse');

    t.is(typeof toggler, 'function');
    t.deepEqual(toggler({
        [name]: false,
        somethingElse: true,
    }), {
        [name]: true,
        somethingElse: true,
    });

    t.deepEqual(toggler({
        [name]: true,
        somethingElse: true,
    }), {
        [name]: false,
        somethingElse: true,
    });

    t.deepEqual(toggler({
        somethingElse: true,
    }), {
        [name]: true,
        somethingElse: true,
    });
};

test('expanding items on click', (t) => {
    const setTreeOpen = sinon.spy();

    const { container } = getContainer({
        setTreeOpen,
    });

    const [div] = container.childNodes;
    const [ul] = div.childNodes;

    bodyTestCases.forEach(({ name }, index) => {
        const child = ul.childNodes[index + 1];
        const [main] = child.childNodes;

        setTreeOpen.resetHistory();
        fireEvent.click(main);

        t.is(setTreeOpen.getCalls().length, 1);

        const [set] = setTreeOpen.getCalls()[0].args;
        testToggler(t, set, name);
    });
});

test('hovering over items', (t) => {
    const onHover = sinon.spy();

    bodyTestCases.forEach(({ name }, index) => {
        onHover.resetHistory();

        const { container } = getContainer({
            onHover,
        });

        const [div] = container.childNodes;
        const [ul] = div.childNodes;

        const child = ul.childNodes[index + 1];
        const [main] = child.childNodes;

        fireEvent.mouseOver(main);
        t.is(onHover.getCalls().length, 1);
        t.deepEqual(onHover.getCalls()[0].args, [name]);

        fireEvent.mouseOut(main);
        t.is(onHover.getCalls().length, 2);
        t.deepEqual(onHover.getCalls()[1].args, [null]);
    });
});

test('toggling items by the tick box', (t) => {
    const toggleTreeItem = sinon.spy();

    const { container } = getContainer({
        toggleTreeItem,
    });

    const [div] = container.childNodes;
    const [ul] = div.childNodes;

    bodyTestCases.forEach(({ name }, index) => {
        toggleTreeItem.resetHistory();

        const child = ul.childNodes[index + 1];
        const [main] = child.childNodes;
        const [, input] = main.childNodes;

        fireEvent.click(input);
        t.is(toggleTreeItem.getCalls().length, 1);
        t.deepEqual(toggleTreeItem.getCalls()[0].args, [name]);
    });
});
