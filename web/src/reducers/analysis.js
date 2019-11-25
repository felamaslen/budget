import { createReducerObject } from 'create-reducer-object';

import {
    ANALYSIS_REQUESTED,
    ANALYSIS_RECEIVED,
    ANALYSIS_BLOCK_REQUESTED,
    ANALYSIS_BLOCK_RECEIVED,
    ANALYSIS_TREE_DISPLAY_TOGGLED,
} from '~client/constants/actions/analysis';

export const initialState = {
    loading: true,
    loadingDeep: false,
    period: 'year',
    grouping: 'category',
    page: 0,
    timeline: null,
    cost: null, // array of values
    costDeep: null, // array of deep values
    saved: null,
    description: null,
    treeVisible: { bills: false },
};

const onRequest = (state, {
    period = state.period,
    grouping = state.grouping,
    page = 0,
}) => ({
    period,
    grouping,
    page,
    loading: true,
    loadingDeep: false,
});

const onReceive = (state, { res }) => ({
    timeline: res.data.timeline,
    cost: res.data.cost,
    saved: res.data.saved,
    costDeep: null,
    description: res.data.description,
    loading: false,
    loadingDeep: false,
});

function onBlockRequest(state, { name }) {
    if (state.costDeep) {
        return {
            loading: false,
            loadingDeep: false,
            costDeep: null,
        };
    }
    if (['bills', 'saved'].includes(name)) {
        return {
            loading: false,
            loadingDeep: false,
        };
    }

    return {
        loading: true,
        loadingDeep: true,
    };
}

const onBlockReceive = (state, { res }) => ({
    costDeep: res.data.items,
    loading: false,
    loadingDeep: false,
});

const onTreeDisplayToggle = (state, { group }) => ({
    treeVisible: { ...state.treeVisible, [group]: state.treeVisible[group] === false },
});

const handlers = {
    [ANALYSIS_REQUESTED]: onRequest,
    [ANALYSIS_RECEIVED]: onReceive,
    [ANALYSIS_BLOCK_REQUESTED]: onBlockRequest,
    [ANALYSIS_BLOCK_RECEIVED]: onBlockReceive,
    [ANALYSIS_TREE_DISPLAY_TOGGLED]: onTreeDisplayToggle,
};

export default createReducerObject(handlers, initialState);
