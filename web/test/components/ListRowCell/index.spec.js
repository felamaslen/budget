import test from 'ava';
import sinon from 'sinon';
import '~client-test/browser';
import { render, fireEvent, act } from '@testing-library/react';
import { createMockStore } from 'redux-test-utils';
import React from 'react';
import { Provider } from 'react-redux';
import { testState } from '~client-test/test_data/state';

import ListRowCell from '~client/components/ListRowCell';

const store = createMockStore(testState);

const getContainer = (customProps = {}, ...args) => {
    const props = {
        page: 'food',
        id: 'some-real-id',
        column: 'item',
        value: 'som',
        onSuggestionConfirmed: () => null,
        active: false,
        setActive: () => null,
        onUpdate: () => null,
        ...customProps,
    };

    return render(
        <Provider store={store}>
            <ListRowCell {...props} />
        </Provider>,
        ...args,
    );
};

test('basic structure', t => {
    const { container } = getContainer();

    t.is(container.childNodes.length, 1);

    const [span] = container.childNodes;

    t.is(span.tagName, 'SPAN');
    t.is(span.childNodes.length, 1);

    const [editable] = span.childNodes;

    t.is(editable.tagName, 'SPAN');
});

test('onUpdate is called when the input changes, with the column and new value', t => {
    const onUpdate = sinon.spy();
    const props = {
        page: 'food',
        column: 'shop',
        value: 'Tesco',
        active: true,
        onUpdate,
    };
    const { container } = getContainer(props);

    const [span] = container.childNodes;
    const [editable] = span.childNodes;
    const [field] = editable.childNodes;
    const [input] = field.childNodes;

    t.is(input.tagName, 'INPUT');

    t.false(onUpdate.calledOnce);
    fireEvent.change(input, { target: { value: 'Wilko' } });

    act(() => {
        getContainer({ ...props, active: false }, { container });
    });

    t.true(onUpdate.calledOnce);
    t.true(onUpdate.calledWith('shop', 'Wilko'));
});

test('onUpdate is not called when the input is blank', t => {
    const onUpdate = sinon.spy();
    const props = {
        page: 'food',
        column: 'shop',
        value: 'Tesco',
        active: true,
        onUpdate,
    };
    const { container } = getContainer(props);

    const [span] = container.childNodes;
    const [editable] = span.childNodes;
    const [field] = editable.childNodes;
    const [input] = field.childNodes;

    t.is(input.tagName, 'INPUT');

    t.false(onUpdate.calledOnce);
    fireEvent.change(input, { target: { value: '' } });

    act(() => {
        getContainer({ ...props, active: false }, { container });
    });

    t.false(onUpdate.calledOnce);
});
