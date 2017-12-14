/**
 * Actions called on the mobile-editing form framework
 */

import * as A from '../constants/actions';

export const aMobileEditDialogOpened = (pageIndex, id) => ({ type: A.FORM_EDIT_DIALOG_OPENED, pageIndex, id });
export const aMobileAddDialogOpened = pageIndex => ({ type: A.FORM_ADD_DIALOG_OPENED, pageIndex });
export const aMobileDialogClosed = req => ({ type: A.FORM_DIALOG_CLOSED, ...req });
export const aFormFieldChanged = (fieldKey, value) => ({ type: A.FORM_INPUT_CHANGED, fieldKey, value });

