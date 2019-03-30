import test from 'ava';
import memoize from 'fast-memoize';
import { render } from 'react-testing-library';
import '~client-test/browser';
import React from 'react';
import { MemoryRouter as Router } from 'react-router-dom';
import Header from '~client/components/Header';

const getHeader = memoize((customProps = {}) => {
    const props = {
        navActive: true,
        loadingApi: false,
        unsavedApi: false,
        onPageSet: () => null,
        onLogout: () => null,
        ...customProps
    };

    return render(
        <Router>
            <Header {...props} />
        </Router>
    );
});

test('rendering its basic structure', t => {
    const { container } = getHeader();
    t.is(container.childNodes.length, 1);

    const [div] = container.childNodes;
    t.is(div.tagName, 'DIV');
    t.is(div.className, 'navbar');
    t.is(div.childNodes.length, 1);

    const [inner] = div.childNodes;
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

