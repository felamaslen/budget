import test from 'ava';
import memoize from 'fast-memoize';
import '~client-test/browser';
import { render } from 'react-testing-library';
import { createMockStore } from 'redux-test-utils';
import reduction from '~client/reduction';
import { Provider } from 'react-redux';
import React from 'react';
import EditableActive from '~client/containers/Editable/editable-active';
import { TransactionsList } from '~client/modules/data';

const getContainer = memoize((customProps = {}) => {
    const props = {
        row: 'ab1',
        col: 1,
        value: { foo: 'bar' },
        onChange: () => null,
        addTransaction: () => null,
        editTransaction: () => null,
        removeTransaction: () => null,
        ...customProps
    };

    const state = reduction;

    const store = createMockStore(state);

    const utils = render(
        <Provider store={store}>
            <EditableActive {...props} />
        </Provider>
    );

    return { store, ...utils };
});

test('rendering transactions items', t => {
    const { container } = getContainer({
        item: 'transactions',
        value: new TransactionsList([])
    });

    t.is(container.childNodes.length, 1);
    const [div] = container.childNodes;
    t.is(div.tagName, 'SPAN');
    t.is(div.className, 'active editable editable-transactions');
});

test('rendering other items', t => {
    const { container } = getContainer({
        item: 'foo'
    });

    t.is(container.childNodes.length, 1);
    const [div] = container.childNodes;
    t.is(div.tagName, 'SPAN');
    t.is(div.className, 'active editable editable-foo');
});
