/**
 * Actions called on content
 */

import buildMessage from '../messageBuilder';
import {
    CONTENT_LOADED, CONTENT_BLOCK_HOVERED, CONTENT_BLOCKS_RECEIVED
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

