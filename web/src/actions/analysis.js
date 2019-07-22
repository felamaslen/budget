import {
    ANALYSIS_REQUESTED,
    ANALYSIS_RECEIVED,
    ANALYSIS_BLOCK_REQUESTED,
    ANALYSIS_BLOCK_RECEIVED,
    ANALYSIS_TREE_DISPLAY_TOGGLED,
    ANALYSIS_TREE_HOVERED
} from '~client/constants/actions/analysis';

export const requested = (req = {}) => ({ type: ANALYSIS_REQUESTED, ...req });

export const received = (res, err = null) => ({ type: ANALYSIS_RECEIVED, res, err });

export const blockRequested = name => ({ type: ANALYSIS_BLOCK_REQUESTED, name });

export const blockReceived = (res, err = null) => ({ type: ANALYSIS_BLOCK_RECEIVED, res, err });

export const treeItemDisplayToggled = group => ({ type: ANALYSIS_TREE_DISPLAY_TOGGLED, group
});

export const treeItemHovered = (group, name) => ({ type: ANALYSIS_TREE_HOVERED, group, name });
