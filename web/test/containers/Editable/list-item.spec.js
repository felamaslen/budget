import test from 'ava';
import '~client-test/browser';
import { render } from 'react-testing-library';
import { createMockStore } from 'redux-test-utils';
import { Provider } from 'react-redux';
import React from 'react';
import ListAddEditItem from '~client/containers/Editable/list-item';

const getContainer = (customProps = {}) => {
    const state = {
        edit: {
            active: {},
            add: {
                food: ['foo', 'bar', 'baz', 'bak', 'ban']
            },
            row: 2,
            col: 4
        }
    };

    const store = createMockStore(state);

    const props = {
        page: 'food',
        row: 3,
        col: 2,
        ...customProps
    };

    const utils = render(
        <Provider store={store}>
            <ListAddEditItem {...props} />
        </Provider>
    );

    return { store, ...utils };
};

test('basic structure', t => {
    const { container } = getContainer();

    t.is(container.childNodes.length, 1);
    const [span] = container.childNodes;
    t.is(span.tagName, 'SPAN');
    t.is(span.className, 'category');
    t.is(span.childNodes.length, 1);
});

test('editable', t => {
    const { container } = getContainer();
    const [span] = container.childNodes;
    const [editable] = span.childNodes;

    t.is(editable.tagName, 'SPAN');
    t.is(editable.className, 'editable editable-category');
});

test('rendering as active', t => {
    const { container } = getContainer({
        row: 2,
        col: 4
    });

    const [span] = container.childNodes;
    t.is(span.className, 'shop active');

    const [editable] = span.childNodes;
    t.is(editable.className, 'editable editable-shop');
});
