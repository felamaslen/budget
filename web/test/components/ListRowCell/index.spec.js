import test from 'ava';
import memoize from 'fast-memoize';
import '~client-test/browser';
import { render } from 'react-testing-library';
import { createMockStore } from 'redux-test-utils';
import { Provider } from 'react-redux';
import { fromJS } from 'immutable';
import React from 'react';

import reduction from '~client/reduction';
import ListRowCell from '~client/components/ListRowCell';

const getContainer = memoize((customProps = {}) => {
    const state = reduction;

    const store = createMockStore(state);

    const props = {
        page: 'page1',
        id: '3',
        row: fromJS({ cols: [null, 'bar'] }),
        colName: 'foo',
        colKey: 1,
        active: true,
        ...customProps
    };

    const utils = render(
        <Provider store={store}>
            <ListRowCell {...props} />
        </Provider>
    );

    return { store, ...utils };
});

test('basic structure', t => {
    const { container } = getContainer();

    t.is(container.childNodes.length, 1);

    const [span] = container.childNodes;

    t.is(span.tagName, 'SPAN');
    t.is(span.className, 'foo active');
    t.is(span.childNodes.length, 1);

    const [editable] = span.childNodes;

    t.is(editable.tagName, 'SPAN');
    t.is(editable.className, 'editable editable-foo');
});

test('no active class while inactive', t => {
    const { container } = getContainer({
        active: false
    });

    const [span] = container.childNodes;

    t.notRegex(span.className, /active/);
});

