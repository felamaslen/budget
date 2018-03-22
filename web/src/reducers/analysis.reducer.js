/**
 * Process analysis data
 */

import { fromJS, Map as map, List as list } from 'immutable';
import { ANALYSIS_VIEW_WIDTH, ANALYSIS_VIEW_HEIGHT } from '../constants/analysis';
import { BlockPacker } from '../helpers/format';

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

export function processPageDataAnalysis(reduction, { raw }) {
    const data = fromJS(raw);

    // tree data
    const cost = getCost(data.get('cost'), data.get('saved'));
    const costTotal = addTotal(cost);
    const items = map({});
    const description = data.get('description');

    // block data
    const treeVisible = reduction.getIn(['other', 'analysis', 'treeVisible']);
    const blocks = getBlocks(cost, treeVisible);

    return reduction
        .setIn(['other', 'analysis', 'timeline'], data.get('timeline'))
        .setIn(['other', 'blockView', 'blocks'], blocks)
        .setIn(['other', 'blockView', 'deep'], null)
        .setIn(['pages', 'analysis'], map({ cost, costTotal, items, description }));
}

export function rAnalysisChangeOption(reduction, { period, grouping, timeIndex }) {
    return reduction
        .setIn(['other', 'analysis', 'loading'], true)
        .setIn(['other', 'analysis', 'period'], period)
        .setIn(['other', 'analysis', 'grouping'], grouping)
        .setIn(['other', 'analysis', 'timeIndex'], timeIndex);
}

export function rAnalysisHandleNewData(reduction, { response, name }) {
    const newReduction = reduction
        .setIn(['other', 'analysis', 'loading'], false)
        .setIn(['other', 'blockView', 'loadKey'], null)
        .setIn(['other', 'blockView', 'status'], '');

    const loadDeep = name && !reduction.getIn(['other', 'blockView', 'deep']);
    if (loadDeep) {
        const cost = getCost(fromJS(response.data.data.items));
        const blocks = getBlocks(cost);

        return newReduction
            .setIn(['other', 'blockView', 'blocks'], blocks)
            .setIn(['other', 'blockView', 'deep'], name);
    }

    return processPageDataAnalysis(newReduction, { raw: response.data.data });
}

export function rAnalysisTreeToggleDisplay(reduction, { key }) {
    const treeVisible = reduction.getIn(['other', 'analysis', 'treeVisible']);
    const newStatus = treeVisible.has(key)
        ? !treeVisible.get(key)
        : false;

    const cost = reduction.getIn(['pages', 'analysis', 'cost']);
    const blocks = getBlocks(cost, treeVisible.set(key, newStatus));

    return reduction.setIn(['other', 'analysis', 'treeVisible', key], newStatus)
        .setIn(['other', 'blockView', 'blocks'], blocks)
        .setIn(['other', 'blockView', 'active'], null);
}

export function rAnalysisTreeToggleExpand(reduction, { key }) {
    const treeOpen = reduction.getIn(['other', 'analysis', 'treeOpen']);
    const newStatus = treeOpen.has(key)
        ? !treeOpen.get(key)
        : true;

    return reduction.setIn(['other', 'analysis', 'treeOpen', key], newStatus);
}

export function rAnalysisTreeHover(reduction, { key }) {
    return reduction.setIn(['other', 'blockView', 'active'], key);
}

export function rAnalysisBlockClick(reduction, { name }) {
    if (name === 'bills' || name === 'saved') {
        return reduction;
    }

    const wasDeep = Boolean(reduction.getIn(['other', 'blockView', 'deep']));

    if (wasDeep) {
        // reset the view to how it was
        const treeVisible = reduction.getIn(['other', 'analysis', 'treeVisible']);
        const cost = reduction.getIn(['pages', 'analysis', 'cost']);
        const blocks = getBlocks(cost, treeVisible);

        return reduction.setIn(['other', 'blockView', 'deep'], null)
            .setIn(['other', 'blockView', 'blocks'], blocks)
            .setIn(['other', 'blockView', 'status'], '');
    }

    // load a deeper view
    return reduction
        .setIn(['other', 'analysis', 'loading'], true);
}

