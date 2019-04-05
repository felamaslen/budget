import test from 'ava';
import '~client-test/browser';
import { fromJS } from 'immutable';
import { render } from 'react-testing-library';
import { createMockStore } from 'redux-test-utils';
import { Provider } from 'react-redux';
import React from 'react';
import Editable from '~client/containers/Editable';

const getContainer = (customProps = {}) => {
    const state = fromJS({
        edit: {
            active: {
                row: 3,
                col: 4
            }
        }
    });

    const store = createMockStore(state);

    const props = {
        ...customProps
    };

    const utils = render(
        <Provider store={store}>
            <Editable {...props} />
        </Provider>
    );

    return { store, ...utils };
};

test('rendering active editable item', t => {
    const { container } = getContainer({
        row: 3,
        col: 4,
        item: 'foo',
        value: 'bar'
    });

    t.is(container.childNodes.length, 1);
    const [span] = container.childNodes;
    t.is(span.tagName, 'SPAN');
    t.is(span.className, 'active editable editable-foo');
});

test('rendering inactive editable item', t => {
    [2, 3, 4].forEach(value => {
        const { container } = getContainer({
            row: value,
            col: value,
            item: 'foo',
            value: 'bar'
        });

        const [span] = container.childNodes;
        t.notRegex(span.className, /active/);
    });
});

