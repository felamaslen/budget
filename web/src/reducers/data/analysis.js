/**
 * Process analysis data
 */

import { fromJS, Map as map } from 'immutable';
import buildMessage from '../../messageBuilder';
import {
    EF_ANALYSIS_DATA_REQUESTED, EF_ANALYSIS_EXTRA_REQUESTED
} from '../../constants/effects';
import {
    PAGES,
    ANALYSIS_PERIODS, ANALYSIS_GROUPINGS,
    ANALYSIS_VIEW_WIDTH, ANALYSIS_VIEW_HEIGHT
} from '../../misc/const';
import { BlockPacker } from '../../misc/format';

const pageIndexAnalysis = PAGES.indexOf('analysis');

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

function getBlocks(cost, treeVisible) {
    const blockData = getBlockData(cost, treeVisible);

    const packer = new BlockPacker(blockData, ANALYSIS_VIEW_WIDTH, ANALYSIS_VIEW_HEIGHT);

    return packer.blocks;
}

function getCost(costData) {
    return costData.map(item => {
        const name = item.get(0);
        const subTree = item.get(1)
            .map(subItem => map({ name: subItem.get(0), total: subItem.get(1) }))
            .sort(sortTotal);

        const total = addTotal(subTree);

        return map({ name, total, subTree });
    })
        .filter(item => item.get('total') > 0)
        .sort(sortTotal);
}

export function processPageDataAnalysis(reduction, pageIndex, raw) {
    const data = fromJS(raw);

    // tree data
    const cost = getCost(data.get('cost'));
    const costTotal = addTotal(cost);
    const items = map({});
    const description = data.get('description');

    // block data
    const treeVisible = reduction.getIn(['appState', 'other', 'analysis', 'treeVisible']);
    const blocks = getBlocks(cost, treeVisible);

    return reduction
        .setIn(['appState', 'other', 'blockView', 'blocks'], blocks)
        .setIn(['appState', 'pages', pageIndex], map({
            cost, costTotal, items, description
        }));
}

export function reloadAnalysis(reduction, newReduction) {
    if (reduction.getIn(['appState', 'other', 'analysis', 'loading'])) {
        return reduction;
    }

    const apiKey = reduction.getIn(['appState', 'user', 'apiKey']);

    const period = ANALYSIS_PERIODS[newReduction.getIn(['appState', 'other', 'analysis', 'period'])];
    const grouping = ANALYSIS_GROUPINGS[newReduction.getIn(['appState', 'other', 'analysis', 'grouping'])];
    const timeIndex = newReduction.getIn(['appState', 'other', 'analysis', 'timeIndex']);
    const loadKey = new Date().getTime();

    const reqObj = { apiKey, period, grouping, timeIndex };

    return newReduction
        .set('effects', reduction.get('effects').push(buildMessage(EF_ANALYSIS_DATA_REQUESTED, reqObj)))
        .setIn(['appState', 'other', 'analysis', 'loading'], true)
        .setIn(['appState', 'other', 'blockView', 'deep'], null)
        .setIn(['appState', 'other', 'blockView', 'loadKey'], loadKey);
}

export function rAnalysisChangePeriod(reduction, period) {
    return reloadAnalysis(reduction,
        reduction.setIn(['appState', 'other', 'analysis', 'period'], period));
}

export function rAnalysisChangeGrouping(reduction, grouping) {
    return reloadAnalysis(reduction,
        reduction.setIn(['appState', 'other', 'analysis', 'grouping'], grouping));
}

export function rAnalysisChangeTimeIndex(reduction, timeIndex) {
    return reloadAnalysis(reduction,
        reduction.setIn(['appState', 'other', 'analysis', 'timeIndex'], timeIndex));
}

export function rAnalysisHandleNewData(reduction, response) {
    const newReduction = reduction
        .setIn(['appState', 'other', 'analysis', 'loading'], false)
        .setIn(['appState', 'other', 'blockView', 'loadKey'], null)
        .setIn(['appState', 'other', 'blockView', 'status'], '');

    const deep = Boolean(response.deepBlock);
    if (deep) {
        const cost = getCost(fromJS(response.data.data.items));
        const blocks = getBlocks(cost);

        return newReduction
            .setIn(['appState', 'other', 'blockView', 'blocks'], blocks)
            .setIn(['appState', 'other', 'blockView', 'deep'], response.deepBlock);
    }

    return processPageDataAnalysis(newReduction, pageIndexAnalysis, response.data.data);
}

export function rAnalysisTreeToggleDisplay(reduction, key) {
    const treeVisible = reduction.getIn(['appState', 'other', 'analysis', 'treeVisible']);
    const newStatus = treeVisible.has(key)
        ? !treeVisible.get(key)
        : false;

    const cost = reduction.getIn(['appState', 'pages', pageIndexAnalysis, 'cost']);
    const blocks = getBlocks(cost, treeVisible.set(key, newStatus));

    return reduction.setIn(['appState', 'other', 'analysis', 'treeVisible', key], newStatus)
        .setIn(['appState', 'other', 'blockView', 'blocks'], blocks)
        .setIn(['appState', 'other', 'blockView', 'active'], null);
}

export function rAnalysisTreeToggleExpand(reduction, key) {
    const treeOpen = reduction.getIn(['appState', 'other', 'analysis', 'treeOpen']);
    const newStatus = treeOpen.has(key)
        ? !treeOpen.get(key)
        : true;

    return reduction.setIn(['appState', 'other', 'analysis', 'treeOpen', key], newStatus);
}

export function rAnalysisTreeHover(reduction, key) {
    return reduction.setIn(['appState', 'other', 'blockView', 'active'], key);
}

export function rAnalysisBlockClick(reduction, name) {
    if (reduction.getIn(['appState', 'other', 'analysis', 'loading'])) {
        return reduction;
    }
    const deep = reduction.getIn(['appState', 'other', 'blockView', 'deep']);
    if (deep === null) {
    // load a deeper view
        if (name === 'bills') {
            return reduction;
        }
        const apiKey = reduction.getIn(['appState', 'user', 'apiKey']);

        const period = ANALYSIS_PERIODS[reduction.getIn(['appState', 'other', 'analysis', 'period'])];
        const grouping = ANALYSIS_GROUPINGS[reduction.getIn(['appState', 'other', 'analysis', 'grouping'])];
        const timeIndex = reduction.getIn(['appState', 'other', 'analysis', 'timeIndex']);

        const reqObj = { apiKey, name, period, grouping, timeIndex };

        return reduction
            .setIn(['appState', 'other', 'analysis', 'loading'], true)
            .set('effects', reduction.get('effects').push(
                buildMessage(EF_ANALYSIS_EXTRA_REQUESTED, reqObj)
            ));
    }

    const treeVisible = reduction.getIn(['appState', 'other', 'analysis', 'treeVisible']);
    const cost = reduction.getIn(['appState', 'pages', pageIndexAnalysis, 'cost']);
    const blocks = getBlocks(cost, treeVisible);

    return reduction.setIn(['appState', 'other', 'blockView', 'deep'], null)
        .setIn(['appState', 'other', 'blockView', 'blocks'], blocks)
        .setIn(['appState', 'other', 'blockView', 'status'], '');
}

