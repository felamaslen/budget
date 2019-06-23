/**
 * Process analysis data
 */

import { fromJS, Map as map, List as list } from 'immutable';
import { ANALYSIS_VIEW_WIDTH, ANALYSIS_VIEW_HEIGHT } from '~client/constants/analysis';
import { BlockPacker } from '~client/modules/format';

function sortTotal(prev, next) {
    if (prev.get('total') > next.get('total')) {
        return -1;
    }

    return 1;
}

const addTotal = cost => cost.reduce((sum, item) => sum + item.get('total'), 0);

function getBlockData(cost, treeVisible) {
    if (treeVisible) {
        return cost.filter(item => {
            if (treeVisible.has(item.get('name'))) {
                return treeVisible.get(item.get('name'));
            }

            return true;
        });
    }

    return cost;
}

function getBlocks(cost, treeVisible = false) {
    const blockData = getBlockData(cost, treeVisible);

    const packer = new BlockPacker(blockData, ANALYSIS_VIEW_WIDTH, ANALYSIS_VIEW_HEIGHT);

    return packer.blocks;
}

function getCost(costData, saved) {
    return costData.map(item => {
        const name = item.get(0);
        const subTree = item.get(1)
            .map(subItem => map({ name: subItem.get(0), total: subItem.get(1) }))
            .sort(sortTotal);

        const total = addTotal(subTree);

        return map({ name, total, subTree });
    })
        .push(map({
            name: 'saved',
            total: saved,
            subTree: list([
                map({ name: 'Saved', total: saved })
            ])
        }))
        .filter(item => item.get('total') > 0)
        .sort(sortTotal);
}

export function processPageDataAnalysis(state, { raw }) {
    const data = fromJS(raw);

    // tree data
    const cost = getCost(data.get('cost'), data.get('saved'));
    const costTotal = addTotal(cost);
    const items = map({});
    const description = data.get('description');

    // block data
    const treeVisible = state.getIn(['other', 'analysis', 'treeVisible']);
    const blocks = getBlocks(cost, treeVisible);

    return state
        .setIn(['other', 'analysis', 'timeline'], data.get('timeline'))
        .setIn(['other', 'blockView', 'blocks'], blocks)
        .setIn(['other', 'blockView', 'deep'], null)
        .setIn(['pages', 'analysis'], map({ cost, costTotal, items, description }));
}

export function rAnalysisChangeOption(state, { period, grouping, timeIndex }) {
    return state
        .setIn(['other', 'analysis', 'loading'], true)
        .setIn(['other', 'analysis', 'period'], period)
        .setIn(['other', 'analysis', 'grouping'], grouping)
        .setIn(['other', 'analysis', 'timeIndex'], timeIndex);
}

export function rAnalysisHandleNewData(state, { response, name }) {
    const nextState = state
        .setIn(['other', 'analysis', 'loading'], false)
        .setIn(['other', 'blockView', 'loadKey'], null)
        .setIn(['other', 'blockView', 'status'], '');

    const loadDeep = name && !state.getIn(['other', 'blockView', 'deep']);
    if (loadDeep) {
        const cost = getCost(fromJS(response.data.data.items));
        const blocks = getBlocks(cost);

        return nextState
            .setIn(['other', 'blockView', 'blocks'], blocks)
            .setIn(['other', 'blockView', 'deep'], name);
    }

    return processPageDataAnalysis(nextState, { raw: response.data.data });
}

export function rAnalysisTreeToggleDisplay(state, { key }) {
    const treeVisible = state.getIn(['other', 'analysis', 'treeVisible']);
    const newStatus = treeVisible.has(key)
        ? !treeVisible.get(key)
        : false;

    const cost = state.getIn(['pages', 'analysis', 'cost']);
    const blocks = getBlocks(cost, treeVisible.set(key, newStatus));

    return state.setIn(['other', 'analysis', 'treeVisible', key], newStatus)
        .setIn(['other', 'blockView', 'blocks'], blocks)
        .setIn(['other', 'blockView', 'active'], null);
}

export function rAnalysisTreeToggleExpand(state, { key }) {
    const treeOpen = state.getIn(['other', 'analysis', 'treeOpen']);
    const newStatus = treeOpen.has(key)
        ? !treeOpen.get(key)
        : true;

    return state.setIn(['other', 'analysis', 'treeOpen', key], newStatus);
}

export function rAnalysisTreeHover(state, { key }) {
    return state.setIn(['other', 'blockView', 'active'], key);
}

export function rAnalysisBlockClick(state, { name }) {
    if (name === 'bills' || name === 'saved') {
        return state;
    }

    const wasDeep = Boolean(state.getIn(['other', 'blockView', 'deep']));

    if (wasDeep) {
        // reset the view to how it was
        const treeVisible = state.getIn(['other', 'analysis', 'treeVisible']);
        const cost = state.getIn(['pages', 'analysis', 'cost']);
        const blocks = getBlocks(cost, treeVisible);

        return state.setIn(['other', 'blockView', 'deep'], null)
            .setIn(['other', 'blockView', 'blocks'], blocks)
            .setIn(['other', 'blockView', 'status'], '');
    }

    // load a deeper view
    return state
        .setIn(['other', 'analysis', 'loading'], true);
}
