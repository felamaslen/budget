/**
 * Actions called to do stuff on the analysis page
 */

import buildMessage from '../messageBuilder';
import {
    ANALYSIS_OPTION_CHANGED, ANALYSIS_DATA_REFRESHED,
    ANALYSIS_TREE_DISPLAY_TOGGLED, ANALYSIS_TREE_EXPAND_TOGGLED,
    ANALYSIS_TREE_HOVERED,
    ANALYSIS_BLOCK_CLICKED
} from '../constants/actions';

import { ANALYSIS_PERIODS, ANALYSIS_GROUPINGS } from '../misc/const';

import { aErrorOpened } from '../actions/ErrorActions';
import { requestContent } from '../effects/content.effects';

async function requestAnalysisData(dispatch, req) {
    const { apiKey, pageIndex, params, deepBlock } = Object.assign({ deepBlock: null }, req);

    try {
        const response = await requestContent({ apiKey, pageIndex, params });

        dispatch(buildMessage(ANALYSIS_DATA_REFRESHED, { response, deepBlock }));
    }
    catch (err) {
        dispatch(aErrorOpened('Error loading analysis data:', err.toString()));
    }
}

export const aOptionChanged = ({
    apiKey, pageIndex, period, grouping, timeIndex
}) => {
    return dispatch => {
        dispatch(buildMessage(ANALYSIS_OPTION_CHANGED, { period, grouping, timeIndex }));

        const params = [
            ANALYSIS_PERIODS[period],
            ANALYSIS_GROUPINGS[grouping],
            timeIndex
        ];

        return requestAnalysisData(dispatch, { apiKey, pageIndex, params });
    };
};


export const aTreeItemDisplayToggled = key => buildMessage(ANALYSIS_TREE_DISPLAY_TOGGLED, key);
export const aTreeItemExpandToggled = key => buildMessage(ANALYSIS_TREE_EXPAND_TOGGLED, key);
export const aTreeItemHovered = key => buildMessage(ANALYSIS_TREE_HOVERED, key);

export const aBlockClicked = ({
    apiKey, pageIndex, name, period, grouping, timeIndex
}, wasDeep) => {
    if (name === 'bills') {
        return null;
    }

    if (wasDeep) {
        return buildMessage(ANALYSIS_BLOCK_CLICKED, false);
    }

    return dispatch => {
        dispatch(buildMessage(ANALYSIS_BLOCK_CLICKED, true));

        const params = ['deep', name, period, grouping, timeIndex];

        return requestAnalysisData(dispatch, { apiKey, pageIndex, params, deepBlock: name });
    };
};

