import { expect } from 'chai';

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

describe('form.actions', () => {
    describe('aMobileEditDialogOpened', () =>
        it('should return FORM_EDIT_DIALOG_OPENED with page, id', () =>
            expect(aMobileEditDialogOpened(10, 11)).to.deep.equal({
                type: FORM_EDIT_DIALOG_OPENED, page: 10, id: 11
            })
        )
    );
    describe('aMobileAddDialogOpened', () =>
        it('should return FORM_ADD_DIALOG_OPENED with page', () =>
            expect(aMobileAddDialogOpened(10)).to.deep.equal({
                type: FORM_ADD_DIALOG_OPENED, page: 10
            })
        )
    );
    describe('aMobileDialogClosed', () =>
        it('should return FORM_DIALOG_CLOSED with req object', () =>
            expect(aMobileDialogClosed({ foo: 'bar' })).to.deep.equal({
                type: FORM_DIALOG_CLOSED,
                foo: 'bar'
            })
        )
    );
    describe('aFormFieldChanged', () =>
        it('should return FORM_INPUT_CHANGED with fieldKey, value', () =>
            expect(aFormFieldChanged(10, 11)).to.deep.equal({
                type: FORM_INPUT_CHANGED,
                fieldKey: 10,
                value: 11
            })
        )
    );
});

