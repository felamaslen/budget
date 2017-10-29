/**
 * Actions called on the mobile-editing form framework
 */

import buildMessage from '../messageBuilder';

import {
    FORM_EDIT_DIALOG_OPENED,
    FORM_ADD_DIALOG_OPENED,
    FORM_DIALOG_CLOSED,
    FORM_INPUT_CHANGED
} from '../constants/actions';

export const aMobileEditDialogOpened = (pageIndex, id) => buildMessage(
    FORM_EDIT_DIALOG_OPENED, { pageIndex, id }
);
export const aMobileAddDialogOpened = pageIndex => buildMessage(
    FORM_ADD_DIALOG_OPENED, { pageIndex }
);
export const aMobileDialogClosed = req => buildMessage(FORM_DIALOG_CLOSED, req);
export const aFormFieldChanged = (fieldKey, value) => buildMessage(
    FORM_INPUT_CHANGED, { fieldKey, value }
);

