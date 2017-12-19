/**
 * Actions called to do stuff on the analysis page
 */

import * as A from '../constants/actions';

export const aOptionChanged = req => ({ type: A.ANALYSIS_OPTION_CHANGED, ...req });
export const aTreeItemDisplayToggled = key => ({ type: A.ANALYSIS_TREE_DISPLAY_TOGGLED, key });
export const aTreeItemExpandToggled = key => ({ type: A.ANALYSIS_TREE_EXPAND_TOGGLED, key });
export const aTreeItemHovered = key => ({ type: A.ANALYSIS_TREE_HOVERED, key });
export const aBlockClicked = req => ({ type: A.ANALYSIS_BLOCK_CLICKED, ...req });
export const aAnalysisDataRefreshed = res => ({ type: A.ANALYSIS_DATA_REFRESHED, ...res });

