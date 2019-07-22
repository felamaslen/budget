import test from 'ava';
import '~client-test/browser';
import { render } from '@testing-library/react';
import { createMockStore } from 'redux-test-utils';
import React from 'react';
import Root from '~client/containers/Root';
import { testState } from '~client-test/test_data/state';

const getContainer = (customProps = {}, customState = state => state) => {
    const state = customState({
        ...testState,
        login: {
            ...testState.login,
            uid: '1'
        },
        api: {
            ...testState.api,
            initialLoading: false,
            loading: false
        }
    });

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

    const [header, errorMessages, page] = div.childNodes;

    t.is(header.tagName, 'HEADER');
    t.is(errorMessages.className, 'messages-outer');
    t.is(page.className, 'page-wrapper');
});
