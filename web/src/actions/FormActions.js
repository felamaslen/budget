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

export const aMobileEditDialogOpened = (pageIndex, rowKey) => {
    return buildMessage(FORM_EDIT_DIALOG_OPENED, { pageIndex, rowKey });
};
export const aMobileAddDialogOpened = pageIndex => {
    return buildMessage(FORM_ADD_DIALOG_OPENED, { pageIndex });
};
export const aMobileDialogClosed = pageIndex => {
    return buildMessage(FORM_DIALOG_CLOSED, pageIndex);
};
export const aFormFieldChanged = (fieldKey, value) => {
    return buildMessage(FORM_INPUT_CHANGED, { fieldKey, value });
};

