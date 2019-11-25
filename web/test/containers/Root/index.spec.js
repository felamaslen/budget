import test from 'ava';
import '~client-test/browser';
import { render } from '@testing-library/react';
import { createMockStore } from 'redux-test-utils';
import { Router } from 'react-router-dom';
import React from 'react';
import { createMemoryHistory } from 'history';
import Root from '~client/containers/Root';
import { testState } from '~client-test/test_data/state';

const getContainer = (customProps = {}, customState = state => state) => {
    const state = customState({
        ...testState,
        login: {
            ...testState.login,
            uid: '1',
        },
        api: {
            ...testState.api,
            initialLoading: false,
            loading: false,
        },
    });

    const store = createMockStore(state);

    const props = {
        store,
        history: {},
        ...customProps,
    };

    const history = createMemoryHistory({
        initialEntries: ['/'],
    });

    const utils = render(
        <Router history={history}>
            <Root {...props} />
        </Router>,
    );

    return { store, ...utils };
};

test('main container', t => {
    const { container } = getContainer();

    t.is(container.childNodes.length, 1);

    const [div] = container.childNodes;

    t.is(div.tagName, 'DIV');
    t.is(div.childNodes.length, 3);

    const [header] = div.childNodes;

    t.is(header.tagName, 'HEADER');
});
