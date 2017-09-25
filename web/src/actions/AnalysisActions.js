/**
 * Actions called to do stuff on the analysis page
 */

import buildMessage from '../messageBuilder';
import {
    ANALYSIS_OPTION_CHANGED,
    ANALYSIS_TREE_DISPLAY_TOGGLED, ANALYSIS_TREE_EXPAND_TOGGLED,
    ANALYSIS_TREE_HOVERED, ANALYSIS_BLOCK_CLICKED,
    ANALYSIS_DATA_REFRESHED
} from '../constants/actions';

import {
    ANALYSIS_DATA_REQUESTED
} from '../constants/effects';

export const aOptionChanged = req => buildMessage(
    ANALYSIS_OPTION_CHANGED, req, ANALYSIS_DATA_REQUESTED
);
export const aTreeItemDisplayToggled = key => buildMessage(ANALYSIS_TREE_DISPLAY_TOGGLED, key);
export const aTreeItemExpandToggled = key => buildMessage(ANALYSIS_TREE_EXPAND_TOGGLED, key);
export const aTreeItemHovered = key => buildMessage(ANALYSIS_TREE_HOVERED, key);
export const aBlockClicked = block => buildMessage(
    ANALYSIS_BLOCK_CLICKED, block, ANALYSIS_DATA_REQUESTED
);
export const aAnalysisDataRefreshed = res => buildMessage(ANALYSIS_DATA_REFRESHED, res);

