/**
 * Actions called on content
 */

import buildMessage from '../messageBuilder';
import {
    CONTENT_LOADED, CONTENT_REQUESTED, CONTENT_BLOCK_HOVERED, CONTENT_BLOCKS_RECEIVED
} from '../constants/actions';

import { aErrorOpened } from '../actions/ErrorActions';
import { requestContent } from '../effects/content.effects';

export const aContentRequested = ({ apiKey, pageIndex, params, query }) => {
    return async dispatch => {
        dispatch(buildMessage(CONTENT_REQUESTED, pageIndex));

        try {
            const response = await requestContent({ apiKey, pageIndex, params, query });

            dispatch(buildMessage(CONTENT_LOADED, { pageIndex, response }));
        }
        catch (err) {
            dispatch(aErrorOpened('An error occurred loading content'));

            dispatch(buildMessage(CONTENT_LOADED, null));
        }
    };
};

export const aContentBlockHovered = (block, subBlock) => {
    return buildMessage(CONTENT_BLOCK_HOVERED, { block, subBlock });
};
export const aContentBlocksReceived = (response, loadKey) => {
    return buildMessage(CONTENT_BLOCKS_RECEIVED, { response, loadKey });
};

