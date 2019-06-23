import ava from 'ava';
import ninos from 'ninos';
const test = ninos(ava);

import memoize from 'fast-memoize';
import '~client-test/browser';
import { render, fireEvent } from 'react-testing-library';
import { createMockStore } from 'redux-test-utils';
import reduction from '~client/reduction';
import { Provider } from 'react-redux';
import React from 'react';
import EditableInactive from '~client/containers/Editable/editable-inactive';
import { formatValue } from '~client/containers/Editable/format';

const getContainer = memoize((customProps = {}) => {
    const props = {
        item: 'foo',
        value: 'bar',
        onActivate: () => null,
        ...customProps
    };

    const state = reduction;

    const store = createMockStore(state);

    const utils = render(
        <Provider store={store}>
            <EditableInactive {...props} />
        </Provider>
    );

    return { store, ...utils };
});

test('basic structure', t => {
    const { container } = getContainer();

    t.is(container.childNodes.length, 1);
    const [span] = container.childNodes;
    t.is(span.tagName, 'SPAN');
    t.is(span.className, 'editable editable-foo');
});

test('rendering its formatted value', t => {
    const { container } = getContainer();
    const [span] = container.childNodes;

    t.is(span.innerHTML, formatValue('foo', 'bar'));
});

test('activation', t => {
    const onActivate = t.context.stub();
    const { container } = getContainer({
        onActivate
    });
    const [span] = container.childNodes;

    t.is(onActivate.calls.length, 0);
    fireEvent.mouseDown(span);
    t.is(onActivate.calls.length, 1);
});
