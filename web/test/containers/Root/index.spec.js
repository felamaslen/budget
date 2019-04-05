import test from 'ava';
import '~client-test/browser';
import { fromJS } from 'immutable';
import { render } from 'react-testing-library';
import { createMockStore } from 'redux-test-utils';
import React from 'react';
import Root from '~client/containers/Root';

const getContainer = (customProps = {}, customState = null) => {
    let state = fromJS({
        user: {
            uid: 1
        },
        currentPage: 'general',
        loading: false,
        loadingApi: false,
        errorMsg: [],
        loginForm: {
            inputStep: 0,
            visible: false,
            active: false,
            values: []
        },
        modalDialog: {
            active: false,
            visible: false,
            loading: false
        },
        edit: {
            requestList: []
        }
    });

    if (customState) {
        state = customState(state);
    }

    const store = createMockStore(state);

    const props = {
        store,
        ...customProps
    };

    const utils = render(
        <Root {...props} />
    );

    return { store, ...utils };
};

test('main container', t => {
    const { container } = getContainer();

    t.is(container.childNodes.length, 1);

    const [div] = container.childNodes;

    t.is(div.tagName, 'DIV');
    t.is(div.className, 'main');
    t.is(div.childNodes.length, 3);
});

