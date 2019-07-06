import test from 'ava';
import '~client-test/browser';
import { render } from 'react-testing-library';
import React from 'react';
import Page from '~client/components/Page';

const getContainer = (customProps = {}) => {
    const props = {
        page: 'general',
        ...customProps
    };

    return render(
        <Page {...props}>
            <span>{'text'}</span>
        </Page>
    );
};

test('basic page container', t => {
    const { container } = getContainer();

    const [div] = container.childNodes;

    t.is(div.tagName, 'DIV');
    t.is(div.className, 'page page-general');

    t.is(div.childNodes.length, 1);

    const [span] = div.childNodes;
    t.is(span.tagName, 'SPAN');
    t.is(span.innerHTML, 'text');
});
