/**
 * Actions called on content
 */

import buildMessage from '../messageBuilder';
import {
    CONTENT_LOADED, CONTENT_REQUESTED, CONTENT_BLOCK_HOVERED
} from '../constants/actions';

import {
    CONTENT_REQUESTED as EF_CONTENT_REQUESTED
} from '../constants/effects';

export const aContentRequested = req => buildMessage(CONTENT_REQUESTED, req, EF_CONTENT_REQUESTED);
export const aContentLoaded = res => buildMessage(CONTENT_LOADED, res);

export const aContentBlockHovered = (block, subBlock) => buildMessage(
    CONTENT_BLOCK_HOVERED, { block, subBlock }
);

