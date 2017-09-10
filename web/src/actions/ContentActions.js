/**
 * Actions called on content
 */

import buildMessage from '../messageBuilder';
import {
    AC_CONTENT_LOADED, AC_CONTENT_BLOCK_HOVERED, AC_CONTENT_BLOCKS_RECEIVED
} from '../constants/actions';

export const aContentLoaded = (response, pageIndex) => {
    return buildMessage(AC_CONTENT_LOADED, { response, pageIndex });
};

export const aContentBlockHovered = (block, subBlock) => {
    return buildMessage(AC_CONTENT_BLOCK_HOVERED, { block, subBlock });
};
export const aContentBlocksReceived = (response, loadKey) => {
    return buildMessage(AC_CONTENT_BLOCKS_RECEIVED, { response, loadKey });
};

