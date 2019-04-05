import test from 'ava';

import {
    aMobileEditDialogOpened,
    aMobileAddDialogOpened,
    aMobileDialogClosed,
    aFormFieldChanged
} from '~client/actions/form.actions';

import {
    FORM_EDIT_DIALOG_OPENED,
    FORM_ADD_DIALOG_OPENED,
    FORM_DIALOG_CLOSED,
    FORM_INPUT_CHANGED
} from '~client/constants/actions';

test('aMobileEditDialogOpened returns FORM_EDIT_DIALOG_OPENED with page, id', t => {
    t.deepEqual(aMobileEditDialogOpened(10, 11), {
        type: FORM_EDIT_DIALOG_OPENED, page: 10, id: 11
    });
});

test('aMobileAddDialogOpened returns FORM_ADD_DIALOG_OPENED with page', t => {
    t.deepEqual(aMobileAddDialogOpened(10), {
        type: FORM_ADD_DIALOG_OPENED, page: 10
    });
});

test('aMobileDialogClosed returns FORM_DIALOG_CLOSED with req object', t => {
    t.deepEqual(aMobileDialogClosed({ foo: 'bar' }), {
        type: FORM_DIALOG_CLOSED,
        foo: 'bar'
    });
});

test('aFormFieldChanged returns FORM_INPUT_CHANGED with fieldKey, value', t => {
    t.deepEqual(aFormFieldChanged(10, 11), {
        type: FORM_INPUT_CHANGED,
        fieldKey: 10,
        value: 11
    });
});

