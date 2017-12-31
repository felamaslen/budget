import { expect } from 'chai';

import * as A from '../../src/actions/form.actions';
import * as C from '../../src/constants/actions';

describe('form.actions', () => {
    describe('aMobileEditDialogOpened', () =>
        it('should return FORM_EDIT_DIALOG_OPENED with page, id', () =>
            expect(A.aMobileEditDialogOpened(10, 11)).to.deep.equal({
                type: C.FORM_EDIT_DIALOG_OPENED, page: 10, id: 11
            })
        )
    );
    describe('aMobileAddDialogOpened', () =>
        it('should return FORM_ADD_DIALOG_OPENED with page', () =>
            expect(A.aMobileAddDialogOpened(10)).to.deep.equal({
                type: C.FORM_ADD_DIALOG_OPENED, page: 10
            })
        )
    );
    describe('aMobileDialogClosed', () =>
        it('should return FORM_DIALOG_CLOSED with req object', () =>
            expect(A.aMobileDialogClosed({ foo: 'bar' })).to.deep.equal({
                type: C.FORM_DIALOG_CLOSED,
                foo: 'bar'
            })
        )
    );
    describe('aFormFieldChanged', () =>
        it('should return FORM_INPUT_CHANGED with fieldKey, value', () =>
            expect(A.aFormFieldChanged(10, 11)).to.deep.equal({
                type: C.FORM_INPUT_CHANGED,
                fieldKey: 10,
                value: 11
            })
        )
    );
});

