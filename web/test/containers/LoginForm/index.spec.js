import test from 'ava';
import memoize from 'fast-memoize';
import '~client-test/browser';
import { render, fireEvent } from '@testing-library/react';
import { createMockStore } from 'redux-test-utils';
import { Provider } from 'react-redux';
import React from 'react';
import LoginForm from '~client/containers/LoginForm';
import { loginRequested } from '~client/actions/login';
import { testState } from '~client-test/test_data/state';

const getContainer = memoize(
    (customProps = {}, customState = state => state) => {
        const state = customState({
            ...testState,
            login: {
                uid: null,
                name: null,
                initialised: true,
                loading: false,
            },
        });

        const store = createMockStore(state);

        const props = {
            ...customProps,
        };

        const utils = render(
            <Provider store={store}>
                <LoginForm {...props} />
            </Provider>,
        );

        return { store, ...utils };
    },
);

test('basic structure', t => {
    const { container } = getContainer();

    t.is(container.childNodes.length, 1);
    const [div] = container.childNodes;

    t.is(div.tagName, 'DIV');
    t.is(div.childNodes.length, 1);

    const [inner] = div.childNodes;
    t.is(inner.tagName, 'DIV');
    t.is(inner.childNodes.length, 3);
});

test('title', t => {
    const { container } = getContainer();
    const [div] = container.childNodes;
    const [inner] = div.childNodes;

    const [title] = inner.childNodes;

    t.is(title.tagName, 'H3');
    t.is(title.innerHTML, 'Enter your PIN:');
});

test('pin display', t => {
    const { container } = getContainer();
    const [div] = container.childNodes;
    const [inner] = div.childNodes;

    const [, pinDisplay] = inner.childNodes;

    t.is(pinDisplay.tagName, 'DIV');
});

test('number input pad', t => {
    const { container } = getContainer();
    const [div] = container.childNodes;
    const [inner] = div.childNodes;

    const [, , pad] = inner.childNodes;

    t.is(pad.tagName, 'DIV');
});

test('listening to input events', t => {
    const { store } = getContainer();

    const action = loginRequested(1234);

    t.false(store.isActionDispatched(action));
    t.is(store.getActions().length, 0);

    fireEvent.keyDown(document.body, { key: '1' });
    t.is(store.getActions().length, 0);

    fireEvent.keyDown(document.body, { key: '2' });
    t.is(store.getActions().length, 0);

    fireEvent.keyDown(document.body, { key: '3' });
    t.is(store.getActions().length, 0);

    fireEvent.keyDown(document.body, { key: '4' });

    t.true(store.isActionDispatched(action));
});

test("doesn't render when the state isn't initialised", t => {
    const { container } = getContainer({}, state => ({
        ...state,
        login: { ...state.login, initialised: false },
    }));

    t.is(container.childNodes.length, 0);
});
