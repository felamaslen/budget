/**
 * Actions called on the mobile-editing form framework
 */

import buildMessage from '../messageBuilder';

import { SERVER_MODAL_EFFECT_HANDLER } from '../constants/effects';

import {
    FORM_EDIT_DIALOG_OPENED,
    FORM_ADD_DIALOG_OPENED,
    FORM_DIALOG_CLOSED,
    FORM_INPUT_CHANGED
} from '../constants/actions';

export const aMobileEditDialogOpened = (pageIndex, id) => {
    return buildMessage(FORM_EDIT_DIALOG_OPENED, { pageIndex, id });
};
export const aMobileAddDialogOpened = pageIndex => {
    return buildMessage(FORM_ADD_DIALOG_OPENED, { pageIndex });
};
export const aMobileDialogClosed = req => {
    return buildMessage(FORM_DIALOG_CLOSED, req, SERVER_MODAL_EFFECT_HANDLER);
};
export const aFormFieldChanged = (fieldKey, value) => {
    return buildMessage(FORM_INPUT_CHANGED, { fieldKey, value });
};

