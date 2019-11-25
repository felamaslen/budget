import test from 'ava';
import '~client-test/browser';
import memoize from 'fast-memoize';
import React from 'react';
import { render } from '@testing-library/react';
import AppLogo from '~client/components/AppLogo';

const getContainer = memoize((customProps = {}) => {
    const props = {
        loading: true,
        unsaved: true,
        ...customProps,
    };

    const utils = render(<AppLogo {...props} />);

    return utils;
});

test('rendering basic structure', t => {
    const { container } = getContainer();

    t.is(container.tagName, 'DIV');
});

test('children', t => {
    const { container } = getContainer();

    t.is(container.childNodes.length, 1);
});

test('logo children', t => {
    const { container } = getContainer();
    const [div] = container.childNodes;

    t.is(div.childNodes.length, 2);
});

test('queue not saved', t => {
    const { container } = getContainer();
    const [div] = container.childNodes;

    const [queue] = div.childNodes;

    t.is(queue.tagName, 'SPAN');
    t.is(queue.innerHTML, 'Unsaved changes!');
});

test('logo', t => {
    const { container } = getContainer();
    const [div] = container.childNodes;

    const [, logo] = div.childNodes;

    t.is(logo.tagName, 'A');
    t.is(logo.childNodes.length, 2);

    const [name, loading] = logo.childNodes;

    t.is(name.tagName, 'SPAN');
    t.is(name.innerHTML, 'Budget');

    t.is(loading.tagName, 'SPAN');
    t.is(loading.childNodes.length, 0);
});

test('no unsaved changes rendered, if there are no requests in the list', t => {
    const { container } = getContainer({
        loading: false,
        unsaved: false,
    });

    const [div] = container.childNodes;

    t.is(div.childNodes.length, 1);

    const [logo] = div.childNodes;
    t.is(logo.tagName, 'A');
});

test('no loading spinner if not loading a request', t => {
    const { container } = getContainer({
        loading: false,
        unsaved: true,
    });

    const [div] = container.childNodes;

    t.is(div.childNodes.length, 2);

    const [, logo] = div.childNodes;

    t.is(logo.childNodes.length, 1);
    const [name] = logo.childNodes;
    t.is(name.innerHTML, 'Budget');
});
