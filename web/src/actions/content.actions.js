/**
 * Actions called on content
 */

import buildMessage from '../messageBuilder';
import {
    CONTENT_LOADED, CONTENT_REQUESTED, CONTENT_BLOCK_HOVERED
} from '../constants/actions';

export const aContentRequested = req => buildMessage(CONTENT_REQUESTED, req);
export const aContentLoaded = res => buildMessage(CONTENT_LOADED, res);
export const aContentBlockHovered = req => buildMessage(CONTENT_BLOCK_HOVERED, req);

