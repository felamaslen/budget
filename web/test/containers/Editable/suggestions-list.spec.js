import test from 'ava';
import '~client-test/browser';
import { fromJS } from 'immutable';
import { render } from 'react-testing-library';
import { createMockStore } from 'redux-test-utils';
import { Provider } from 'react-redux';
import React from 'react';
import SuggestionsList from '~client/containers/Editable/suggestions-list';

const getContainer = (customProps = {}) => {
    const state = fromJS({
        editSuggestions: {
            list: ['foo', 'bar'],
            active: 1
        }
    });

    const store = createMockStore(state);

    const props = {
        page: 'food',
        row: 3,
        col: 2,
        ...customProps
    };

    const utils = render(
        <Provider store={store}>
            <SuggestionsList {...props} />
        </Provider>
    );

    return { store, ...utils };
};

test('list of suggestions', t => {
    const { container } = getContainer();

    t.is(container.childNodes.length, 1);

    const [ul] = container.childNodes;
    t.is(ul.tagName, 'UL');
    t.is(ul.className, 'suggestions');
    t.is(ul.childNodes.length, 2);

    const [li0, li1] = ul.childNodes;

    t.is(li0.tagName, 'LI');
    t.is(li1.tagName, 'LI');

    t.regex(li0.className, /suggestion/);
    t.regex(li1.className, /suggestion/);

    t.is(li0.innerHTML, 'foo');
    t.is(li1.innerHTML, 'bar');
});

test('rendering an active class on the active suggestion, if there is one', t => {
    const { container } = getContainer();

    const [ul] = container.childNodes;
    const [li0, li1] = ul.childNodes;

    t.notRegex(li0.className, /active/);
    t.regex(li1.className, /active/);
});

