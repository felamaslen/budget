import * as actions from '~client/constants/actions/analysis';

export const optionChanged = req => ({
    type: actions.ANALYSIS_OPTION_CHANGED,
    req
});

export const analysisDataRefreshed = (res, err = null) => ({
    type: actions.ANALYSIS_DATA_REFRESHED,
    res,
    err
});

export const treeItemDisplayToggled = key => ({
    type: actions.ANALYSIS_TREE_DISPLAY_TOGGLED,
    key
});

export const treeItemExpandToggled = key => ({
    type: actions.ANALYSIS_TREE_EXPAND_TOGGLED,
    key
});

export const treeItemHovered = key => ({ type: actions.ANALYSIS_TREE_HOVERED, key });

export const blockClicked = req => ({ type: actions.ANALYSIS_BLOCK_CLICKED, req });
