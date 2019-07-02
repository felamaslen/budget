import { createReducerObject } from 'create-reducer-object';

import {
    ANALYSIS_OPTION_CHANGED,
    ANALYSIS_DATA_REFRESHED,
    ANALYSIS_TREE_DISPLAY_TOGGLED,
    ANALYSIS_TREE_HOVERED,
    ANALYSIS_BLOCK_CLICKED
} from '~client/constants/actions/analysis';

export const initialState = {
    loading: true,
    period: 'year',
    grouping: 'category',
    page: 0,
    timeline: null,
    cost: null,
    deep: null,
    saved: null,
    description: null,
    activeGroup: null,
    activeBlock: null,
    treeVisible: { bills: false }
};

const onChangeOption = (state, {
    period = state.period,
    grouping = state.grouping,
    page = 0
}) => ({ period, grouping, page, loading: true });

function onDataRefresh(state, { res }) {
    if (res.data.items) {
        return {
            deep: res.data.items,
            loading: false
        };
    }

    return {
        timeline: res.data.timeline,
        cost: res.data.cost,
        saved: res.data.saved,
        deep: null,
        description: res.data.description,
        loading: false
    };
}

const onTreeDisplayToggle = (state, { group }) => ({
    treeVisible: { ...state.treeVisible, [group]: !state.treeVisible[group] }
});

const onTreeHover = (state, { group, name }) => ({ activeGroup: group, activeBlock: name });

function onBlockClick(state, { name }) {
    if (state.deep) {
        return { deep: null };
    }
    if (['bills', 'saved'].includes(name)) {
        return {};
    }

    return { loading: true, deep: name };
}

const handlers = {
    [ANALYSIS_OPTION_CHANGED]: onChangeOption,
    [ANALYSIS_DATA_REFRESHED]: onDataRefresh,
    [ANALYSIS_TREE_DISPLAY_TOGGLED]: onTreeDisplayToggle,
    [ANALYSIS_TREE_HOVERED]: onTreeHover,
    [ANALYSIS_BLOCK_CLICKED]: onBlockClick
};

export default createReducerObject(handlers, initialState);
