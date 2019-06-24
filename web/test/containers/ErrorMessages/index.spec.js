import test from 'ava';
import '~client-test/browser';
import { render, fireEvent } from 'react-testing-library';
import { createMockStore } from 'redux-test-utils';
import { Provider } from 'react-redux';
import React from 'react';
import ErrorMessages from '~client/containers/ErrorMessages';
import { ERROR_LEVEL_ERROR, ERROR_LEVEL_WARN } from '~client/constants/error';
import { ERROR_CLOSED } from '~client/constants/actions';

const getContainer = (customProps = {}) => {
    const state = {
        errorMsg: [
            { id: 'f1101', level: ERROR_LEVEL_ERROR, closed: false, text: 'foo' },
            { id: 'g1923', level: ERROR_LEVEL_WARN, closed: true, text: 'bar' }
        ]
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
            <ErrorMessages {...props} />
        </Provider>
    );

    return { store, ...utils };
};

test('basic structure', t => {
    const { container } = getContainer();

    t.is(container.childNodes.length, 1);
    const [ul] = container.childNodes;
    t.is(ul.tagName, 'UL');
    t.is(ul.className, 'messages-outer');
    t.is(ul.childNodes.length, 2);
});

test('each message', t => {
    const { container } = getContainer();

    const [ul] = container.childNodes;

    const [li0, li1] = ul.childNodes;

    t.is(li0.tagName, 'LI');
    t.is(li0.className, 'message error');
    t.is(li0.childNodes.length, 1);

    const [span0] = li0.childNodes;
    t.is(span0.tagName, 'SPAN');
    t.is(span0.innerHTML, 'foo');

    t.is(li1.tagName, 'LI');
    t.is(li1.className, 'message warn closed');

    const [span1] = li1.childNodes;
    t.is(span1.tagName, 'SPAN');
    t.is(span1.innerHTML, 'bar');
});

test('closing messages when clicking them', t => {
    const { container, store } = getContainer();

    t.false(store.isActionDispatched({ type: ERROR_CLOSED, msgId: 'f1101' }));
    fireEvent.click(container.childNodes[0].childNodes[0]);
    t.true(store.isActionDispatched({ type: ERROR_CLOSED, msgId: 'f1101' }));

    t.false(store.isActionDispatched({ type: ERROR_CLOSED, msgId: 'g1923' }));
    fireEvent.click(container.childNodes[0].childNodes[1]);
    t.true(store.isActionDispatched({ type: ERROR_CLOSED, msgId: 'g1923' }));
});
