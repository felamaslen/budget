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
        </Provider>
    );

    return { ...utils, store };
});

test('rendering its basic structure', t => {
    const { container } = getHeader();
    t.is(container.childNodes.length, 1);

    const [header] = container.childNodes;
    t.is(header.tagName, 'HEADER');
    t.is(header.className, 'navbar');
    t.is(header.childNodes.length, 1);

    const [inner] = header.childNodes;
    t.is(inner.tagName, 'DIV');
    t.is(inner.className, 'inner');
    t.is(inner.childNodes.length, 2);
});

test('renders <AppLogo />', t => {
    const { container } = getHeader();

    const [div] = container.childNodes;
    const [inner] = div.childNodes;
    const [appLogo] = inner.childNodes;

    t.is(appLogo.tagName, 'DIV');
    t.is(appLogo.className, 'app-logo');
});

test('renders <Navbar />', t => {
    const { container } = getHeader();

    const [div] = container.childNodes;
    const [inner] = div.childNodes;
    const [, navBar] = inner.childNodes;

    t.is(navBar.tagName, 'NAV');
    t.is(navBar.className, 'nav-list noselect');
});

test('navbar isn\'t rendered when logged out', t => {
    const { container } = getHeader({
        ...testState,
        login: {
            ...testState.login,
            uid: null
        }
    });

    const [div] = container.childNodes;
    const [inner] = div.childNodes;

    t.is(inner.childNodes.length, 1);

    const [appLogo] = inner.childNodes;

    t.is(appLogo.className, 'app-logo');
});
