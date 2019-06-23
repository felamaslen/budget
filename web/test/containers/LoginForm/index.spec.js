import test from 'ava';
import memoize from 'fast-memoize';
import '~client-test/browser';
import { fromJS } from 'immutable';
import { render, fireEvent } from 'react-testing-library';
import { createMockStore } from 'redux-test-utils';
import { Provider } from 'react-redux';
import React from 'react';
import LoginForm from '~client/containers/LoginForm';
import { aLoginFormInputted } from '~client/actions/login.actions';

const getContainer = memoize((customProps = {}) => {
    const state = fromJS({
        loginForm: {
            inputStep: 3,
            values: [5, 1, 2],
            visible: true,
            active: true
        }
    });

    const store = createMockStore(state);

    const props = {
        ...customProps
    };

    const utils = render(
        <Provider store={store}>
            <LoginForm {...props} />
        </Provider>
    );

    return { store, ...utils };
});

test('basic structure', t => {
    const { container } = getContainer();

    t.is(container.childNodes.length, 1);
    const [div] = container.childNodes;

    t.is(div.tagName, 'DIV');
    t.is(div.className, 'login-form active');
    t.is(div.childNodes.length, 3);
});

test('title', t => {
    const { container } = getContainer();
    const [div] = container.childNodes;

    const [title] = div.childNodes;

    t.is(title.tagName, 'H3');
    t.is(title.innerHTML, 'Enter your PIN:');
});

test('pin display', t => {
    const { container } = getContainer();
    const [div] = container.childNodes;

    const [, pinDisplay] = div.childNodes;

    t.is(pinDisplay.tagName, 'DIV');
    t.is(pinDisplay.className, 'pin-display');
});

test('number input pad', t => {
    const { container } = getContainer();
    const [div] = container.childNodes;

    const [, , pad] = div.childNodes;

    t.is(pad.tagName, 'DIV');
    t.is(pad.className, 'number-input noselect');
});

test('dispatching a number on input', t => {
    const { store, container } = getContainer();
    const [div] = container.childNodes;
    const [, , pad] = div.childNodes;
    const [row] = pad.childNodes;
    const [button] = row.childNodes;

    t.is(button.tagName, 'BUTTON');

    const action = aLoginFormInputted(1);

    t.false(store.isActionDispatched(action));

    fireEvent.mouseDown(button);
    t.true(store.isActionDispatched(action));
});
