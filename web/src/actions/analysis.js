import * as actions from '~client/constants/actions/analysis';

export const optionChanged = req => ({
    type: actions.ANALYSIS_OPTION_CHANGED,
    ...req
});

export const analysisDataRefreshed = (res, err = null) => ({
    type: actions.ANALYSIS_DATA_REFRESHED,
    res,
    err
});

export const treeItemDisplayToggled = group => ({
    type: actions.ANALYSIS_TREE_DISPLAY_TOGGLED,
    group
});

export const treeItemHovered = (group, name) => ({ type: actions.ANALYSIS_TREE_HOVERED, group, name });

export const blockClicked = name => ({ type: actions.ANALYSIS_BLOCK_CLICKED, name });
