/**
 * Actions called to do stuff on the analysis page
 */

import buildMessage from '../messageBuilder';
import {
    ANALYSIS_PERIOD_CHANGED, ANALYSIS_GROUPING_CHANGED,
    ANALYSIS_TIME_INDEX_CHANGED, ANALYSIS_DATA_REFRESHED,
    ANALYSIS_TREE_DISPLAY_TOGGLED, ANALYSIS_TREE_EXPAND_TOGGLED,
    ANALYSIS_TREE_HOVERED,
    ANALYSIS_BLOCK_CLICKED
} from '../constants/actions';

export const aPeriodChanged = period => buildMessage(ANALYSIS_PERIOD_CHANGED, period);
export const aGroupingChanged = grouping => buildMessage(ANALYSIS_GROUPING_CHANGED, grouping);
export const aTimeIndexChanged = timeIndex => buildMessage(ANALYSIS_TIME_INDEX_CHANGED, timeIndex);
export const aAnalysisDataReceived = response => buildMessage(ANALYSIS_DATA_REFRESHED, response);

export const aTreeItemDisplayToggled = key => buildMessage(ANALYSIS_TREE_DISPLAY_TOGGLED, key);
export const aTreeItemExpandToggled = key => buildMessage(ANALYSIS_TREE_EXPAND_TOGGLED, key);
export const aTreeItemHovered = key => buildMessage(ANALYSIS_TREE_HOVERED, key);

export const aBlockClicked = key => buildMessage(ANALYSIS_BLOCK_CLICKED, key);

