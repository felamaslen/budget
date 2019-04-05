import ava from 'ava';
import ninos from 'ninos';
const test = ninos(ava);

import '~client-test/browser';
import memoize from 'fast-memoize';
import { List as list } from 'immutable';
import { render, fireEvent } from 'react-testing-library';
import { createMockStore } from 'redux-test-utils';
import reduction from '~client/reduction';
import { Provider } from 'react-redux';
import React from 'react';
import InteractiveEditable from '~client/containers/Editable/interactive-editable';

const getContainer = memoize((customProps = {}) => {
    const props = {
        item: 'foo',
        value: 'bar',
        suggestionsList: list.of(),
        suggestionsActive: -1,
        onChange: () => null,
        ...customProps
    };

    const state = reduction
        .setIn(['editSuggestions', 'list'], list.of('foobar', 'foobar2000'))
        .setIn(['editSuggestions', 'active'], 0);

    const store = createMockStore(state);

    const utils = render(
        <Provider store={store}>
            <InteractiveEditable {...props} />
        </Provider>
    );

    return { store, ...utils };
});

test('basic structure', t => {
    const { container } = getContainer();

    t.is(container.childNodes.length, 1);
    const [span] = container.childNodes;
    t.is(span.tagName, 'SPAN');
    t.is(span.className, 'active editable editable-foo');
    t.is(span.childNodes.length, 2);
});

test('rendering an input', t => {
    const { container } = getContainer();
    const [span] = container.childNodes;
    const [input] = span.childNodes;

    t.is(input.tagName, 'INPUT');
    t.is(input.type, 'text');
    t.is(input.value, 'bar');
});

test('handling onchange event', t => {
    const onChange = t.context.stub();
    const { container } = getContainer({
        onChange
    });

    t.is(onChange.calls.length, 0);
    const [span] = container.childNodes;
    const [input] = span.childNodes;

    fireEvent.change(input, { target: { value: '5' } });

    t.is(onChange.calls.length, 1);
    t.deepEqual(onChange.calls[0].arguments, ['5']);
});

test('suggestions list', t => {
    const { container } = getContainer();
    const [span] = container.childNodes;
    const [, suggestionsList] = span.childNodes;

    t.is(suggestionsList.tagName, 'UL');
    t.is(suggestionsList.className, 'suggestions');
});

