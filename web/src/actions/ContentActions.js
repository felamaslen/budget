/**
 * Actions called on content
 */

import buildMessage from '../messageBuilder';
import {
    CONTENT_LOADED, CONTENT_BLOCK_HOVERED, CONTENT_BLOCKS_RECEIVED,
    CONTENT_EDIT_DIALOG_OPENED, CONTENT_EDIT_DIALOG_CLOSED,
    CONTENT_ADD_DIALOG_OPENED, CONTENT_ADD_DIALOG_CLOSED
} from '../constants/actions';

export const aContentLoaded = (response, pageIndex) => {
    return buildMessage(CONTENT_LOADED, { response, pageIndex });
};

export const aContentBlockHovered = (block, subBlock) => {
    return buildMessage(CONTENT_BLOCK_HOVERED, { block, subBlock });
};
export const aContentBlocksReceived = (response, loadKey) => {
    return buildMessage(CONTENT_BLOCKS_RECEIVED, { response, loadKey });
};

export const aMobileEditDialogOpened = (pageIndex, rowKey) => {
    return buildMessage(CONTENT_EDIT_DIALOG_OPENED, { pageIndex, rowKey });
};
export const aMobileAddDialogOpened = pageIndex => {
    return buildMessage(CONTENT_ADD_DIALOG_OPENED, { pageIndex });
};
export const aMobileEditDialogClosed = submit => {
    return buildMessage(CONTENT_EDIT_DIALOG_CLOSED, { submit });
};
export const aMobileAddDialogClosed = submit => {
    return buildMessage(CONTENT_ADD_DIALOG_CLOSED, { submit });
};

