import ava from 'ava';
import ninos from 'ninos';
const test = ninos(ava);

import memoize from 'fast-memoize';
import '~client-test/browser';
import { fromJS, Map as map, List as list } from 'immutable';
import { render } from 'react-testing-library';
import { createMockStore } from 'redux-test-utils';
import { Provider } from 'react-redux';
import React from 'react';
import ModalDialogField from '~client/components/FormField/modal-dialog-field';
import { TransactionsList } from '~client/modules/data';

const getModalDialogField = memoize((customProps = {}) => {
    const state = fromJS({
    });

    const store = createMockStore(state);

    const props = {
        fieldKey: 3,
        field: map({
            item: 'foo',
            value: 'bar'
        }),
        invalidKeys: list.of(),
        ...customProps
    };

    const utils = render((
        <Provider store={store}>
            <ModalDialogField {...props} />
        </Provider>
    ));

    return { ...utils, store };
});

test('basic structure', t => {
    const { container } = getModalDialogField();

    t.is(container.childNodes.length, 1);
    const [li] = container.childNodes;
    t.is(li.tagName, 'LI');
    t.is(li.className, 'form-row foo');
    t.is(li.childNodes.length, 2);
});

test('label', t => {
    const { container } = getModalDialogField();
    const [li] = container.childNodes;

    const [label] = li.childNodes;
    t.is(label.tagName, 'SPAN');
    t.is(label.className, 'form-label');
    t.is(label.innerHTML, 'foo');
});

test('form field container', t => {
    const { container } = getModalDialogField();
    const [li] = container.childNodes;

    const [, formField] = li.childNodes;

    t.is(formField.tagName, 'DIV');
    const [input] = formField.childNodes;
    t.is(input.tagName, 'INPUT');
});

test('invalid class', t => {
    const { container } = getModalDialogField({
        invalidKeys: list.of(3)
    });

    const [li] = container.childNodes;

    t.is(li.className, 'form-row foo invalid');
});

test('transactions fields', t => {
    const { container } = getModalDialogField({
        field: map({
            item: 'transactions',
            value: new TransactionsList([])
        })
    });

    t.is(container.childNodes.length, 1);
    const [li] = container.childNodes;

    t.is(li.childNodes.length, 1);
    const [div] = li.childNodes;

    t.is(div.tagName, 'DIV');
    t.is(div.childNodes.length, 2);
    t.is(div.className, 'inner');
});

