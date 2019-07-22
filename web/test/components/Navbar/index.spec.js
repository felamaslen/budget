import ava from 'ava';
import ninos from 'ninos';
const test = ninos(ava);

import '~client-test/browser';
import { render, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import React from 'react';
import Navbar from '~client/components/Navbar';

const getContainer = (customProps = {}) => {
    const props = {
        onLogout: () => null,
        ...customProps
    };

    return render(
        <MemoryRouter>
            <Navbar {...props} />
        </MemoryRouter>
    );
};

test('basic structure', t => {
    const { container } = getContainer();

    t.is(container.childNodes.length, 1);
    const [nav] = container.childNodes;

    t.is(nav.tagName, 'NAV');
    t.is(nav.className, 'nav-list noselect');
    t.is(nav.childNodes.length, 10);
});

const pageCases = [
    { page: 'overview', path: '/' },
    { page: 'analysis', path: '/analysis' },
    { page: 'funds', path: '/funds' },
    { page: 'income', path: '/income' },
    { page: 'bills', path: '/bills' },
    { page: 'food', path: '/food' },
    { page: 'general', path: '/general' },
    { page: 'holiday', path: '/holiday' },
    { page: 'social', path: '/social' }
];

pageCases.forEach(({ page, path }, index) => {
    test(`rendering a button for the ${page} page`, t => {
        const { container } = getContainer();
        const [nav] = container.childNodes;

        const link = nav.childNodes[index];

        t.is(link.tagName, 'A');
        t.regex(link.className, new RegExp(`nav-link nav-link-${page}`));
        if (path === '/') {
            t.regex(link.className, /active/);
        } else {
            t.notRegex(link.className, /active/);
        }

        t.is(link.href, path);
    });
});

test('logout button', t => {
    const onLogout = t.context.stub();
    const { container } = getContainer({
        onLogout
    });

    const [nav] = container.childNodes;
    const link = nav.childNodes[9];

    t.is(link.tagName, 'A');
    t.is(link.className, 'nav-link nav-link-logout');
    t.is(link.innerHTML, 'Log out');

    t.is(onLogout.calls.length, 0);
    fireEvent.click(link);
    t.is(onLogout.calls.length, 1);
});
