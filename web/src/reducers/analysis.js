import { createReducerObject } from 'create-reducer-object';

import {
    ANALYSIS_REQUESTED,
    ANALYSIS_RECEIVED,
    ANALYSIS_BLOCK_REQUESTED,
    ANALYSIS_BLOCK_RECEIVED,
    ANALYSIS_TREE_DISPLAY_TOGGLED,
    ANALYSIS_TREE_HOVERED,
    ANALYSIS_BLOCK_CLICKED
} from '~client/constants/actions/analysis';

export const initialState = {
    loading: true,
    loadingDeep: false,
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

const onRequest = (state, {
    period = state.period,
    grouping = state.grouping,
    page = 0
}) => ({
    period,
    grouping,
    page,
    loading: true,
    loadingDeep: false
});

const onReceive = (state, { res }) => ({
    timeline: res.data.timeline,
    cost: res.data.cost,
    saved: res.data.saved,
    deep: null,
    description: res.data.description,
    loading: false,
    loadingDeep: false
});

function onBlockRequest(state, { name }) {
    if (state.deep) {
        return { loading: false, loadingDeep: false, deep: null, deepBlock: null };
    }
    if (['bills', 'saved'].includes(name)) {
        return { loading: false, loadingDeep: false };
    }

    return { loading: true, loadingDeep: true, deepBlock: name };
}

const onBlockReceive = (state, { res }) => ({
    deep: res.data.items,
    loading: false,
    loadingDeep: false
});

const onTreeDisplayToggle = (state, { group }) => ({
    treeVisible: { ...state.treeVisible, [group]: !state.treeVisible[group] }
});

const onTreeHover = (state, { group, name }) => ({ activeGroup: group, activeBlock: name });

const handlers = {
    [ANALYSIS_REQUESTED]: onRequest,
    [ANALYSIS_RECEIVED]: onReceive,
    [ANALYSIS_BLOCK_REQUESTED]: onBlockRequest,
    [ANALYSIS_BLOCK_RECEIVED]: onBlockReceive,
    [ANALYSIS_TREE_DISPLAY_TOGGLED]: onTreeDisplayToggle,
    [ANALYSIS_TREE_HOVERED]: onTreeHover
};

export default createReducerObject(handlers, initialState);
