import test from 'ava';
import memoize from 'fast-memoize';
import { render } from '@testing-library/react';
import '~client-test/browser';
import React from 'react';
import { Provider } from 'react-redux';
import { createMockStore } from 'redux-test-utils';
import { MemoryRouter as Router } from 'react-router-dom';
import Header from '~client/containers/Header';
import { testState } from '~client-test/test_data/state';

const getHeader = memoize((customState = testState) => {
    const store = createMockStore(customState);

    const utils = render(
        <Provider store={store}>
            <Router>
                <Header />
            </Router>
        </Provider>,
    );

    return { ...utils, store };
});

test('rendering its basic structure', t => {
    const { container } = getHeader();
    t.is(container.childNodes.length, 1);

    const [header] = container.childNodes;
    t.is(header.tagName, 'HEADER');
    t.is(header.childNodes.length, 2);
});

test('renders <AppLogo />', t => {
    const { container } = getHeader();

    const [div] = container.childNodes;
    const [appLogo] = div.childNodes;

    t.is(appLogo.tagName, 'DIV');
});

test('renders <Navbar />', t => {
    const { container } = getHeader();

    const [div] = container.childNodes;
    const [, navBar] = div.childNodes;

    t.is(navBar.tagName, 'NAV');
});

test("navbar isn't rendered when logged out", t => {
    const { container } = getHeader({
        ...testState,
        login: {
            ...testState.login,
            uid: null,
        },
    });

    const [div] = container.childNodes;

    t.is(div.childNodes.length, 1);
});
