import ava from 'ava';
import ninos from 'ninos';
const test = ninos(ava);

import memoize from 'fast-memoize';
import { DateTime } from 'luxon';
import '~client-test/browser';
import { render, fireEvent } from '@testing-library/react';
import { Provider } from 'react-redux';
import { createMockStore } from 'redux-test-utils';
import React from 'react';
import { testState } from '~client-test/test_data/state';
import AddForm from '~client/components/ListBodyDesktop/AddForm';

const getAddForm = memoize((customProps = {}) => {
    const props = {
        page: 'food',
        addBtnFocus: false,
        onAdd: () => null,
        ...customProps
    };

    const state = {
        ...testState,
        currentPage: 'food',
        edit: {
            ...testState.edit,
            add: {
                food: [
                    DateTime.local(),
                    'foo',
                    'bar',
                    302,
                    'baz'
                ]
            }
        }
    };

    const store = createMockStore(state);

    const utils = render(
        <Provider store={store}>
            <AddForm {...props} />
        </Provider>
    );

    return { store, ...utils };
});

test('rendering basic structure', t => {
    const { container } = getAddForm();

    t.is(container.tagName, 'DIV');
    t.is(container.childNodes.length, 1);

    const [li] = container.childNodes;
    t.is(li.tagName, 'LI');
    t.is(li.className, 'li-add');
    t.is(li.childNodes.length, 6);
});

test('rendering add item form elements', t => {
    t.plan(5 * 2);

    const { container } = getAddForm();
    const [li] = container.childNodes;

    [
        'date',
        'item',
        'category',
        'cost',
        'shop'
    ]
        .forEach((name, index) => {
            const item = li.childNodes[index];

            t.is(item.tagName, 'SPAN');
            t.is(item.className, name);
        });
});

test('rendering add button', t => {
    const { container } = getAddForm();
    const [li] = container.childNodes;

    const [, , , , , addButton] = li.childNodes;

    t.is(addButton.tagName, 'SPAN');
    t.is(addButton.className, 'add-button-outer');
    t.is(addButton.childNodes.length, 1);

    const [button] = addButton.childNodes;
    t.is(button.tagName, 'BUTTON');
    t.is(button.innerHTML, 'Add');
});

test('dispatching an action when the add button is pressed', t => {
    const onAdd = t.context.stub();

    const { container } = getAddForm({
        onAdd
    });

    const [li] = container.childNodes;
    const [, , , , , addButton] = li.childNodes;
    const [button] = addButton.childNodes;

    fireEvent.click(button);

    t.is(onAdd.calls.length, 1);
    t.deepEqual(onAdd.calls[0].arguments, ['food']);
});
