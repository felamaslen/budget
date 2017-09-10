/**
 * Actions called to do stuff on the analysis page
 */

import buildMessage from '../messageBuilder';
import {
    AC_ANALYSIS_PERIOD_CHANGED, AC_ANALYSIS_GROUPING_CHANGED,
    AC_ANALYSIS_TIME_INDEX_CHANGED, AC_ANALYSIS_DATA_REFRESHED,
    AC_ANALYSIS_TREE_DISPLAY_TOGGLED, AC_ANALYSIS_TREE_EXPAND_TOGGLED,
    AC_ANALYSIS_TREE_HOVERED,
    AC_ANALYSIS_BLOCK_CLICKED
} from '../constants/actions';

export const aPeriodChanged = period => buildMessage(AC_ANALYSIS_PERIOD_CHANGED, period);
export const aGroupingChanged = grouping => buildMessage(AC_ANALYSIS_GROUPING_CHANGED, grouping);
export const aTimeIndexChanged = timeIndex => buildMessage(AC_ANALYSIS_TIME_INDEX_CHANGED, timeIndex);
export const aAnalysisDataReceived = response => buildMessage(AC_ANALYSIS_DATA_REFRESHED, response);

export const aTreeItemDisplayToggled = key => buildMessage(AC_ANALYSIS_TREE_DISPLAY_TOGGLED, key);
export const aTreeItemExpandToggled = key => buildMessage(AC_ANALYSIS_TREE_EXPAND_TOGGLED, key);
export const aTreeItemHovered = key => buildMessage(AC_ANALYSIS_TREE_HOVERED, key);

export const aBlockClicked = key => buildMessage(AC_ANALYSIS_BLOCK_CLICKED, key);

