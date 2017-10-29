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

export const aOptionChanged = req => buildMessage(ANALYSIS_OPTION_CHANGED, req);
export const aTreeItemDisplayToggled = key => buildMessage(ANALYSIS_TREE_DISPLAY_TOGGLED, key);
export const aTreeItemExpandToggled = key => buildMessage(ANALYSIS_TREE_EXPAND_TOGGLED, key);
export const aTreeItemHovered = key => buildMessage(ANALYSIS_TREE_HOVERED, key);
export const aBlockClicked = req => buildMessage(ANALYSIS_BLOCK_CLICKED, req);
export const aAnalysisDataRefreshed = res => buildMessage(ANALYSIS_DATA_REFRESHED, res);

