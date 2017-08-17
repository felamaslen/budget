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

const sortTotal = (a, b) => {
    return a.get('total') > b.get('total') ? -1 : 1;
};
const addTotal = cost => cost.reduce((a, b) => a + b.get('total'), 0);

const getBlocks = (cost, treeVisible) => {
    const blockData = treeVisible ? cost.filter(item => {
        return treeVisible.has(item.get('name')) ? treeVisible.get(item.get('name')) : true;
    }) : cost;
    const packer = new BlockPacker(blockData, ANALYSIS_VIEW_WIDTH, ANALYSIS_VIEW_HEIGHT);
    return packer.blocks;
};

const getCost = costData => {
    return costData.map(item => {
        const name = item.get(0);
        const subTree = item.get(1).map(subItem => {
            return map({ name: subItem.get(0), total: subItem.get(1) });
        }).sort(sortTotal);
        const total = addTotal(subTree);

        return map({ name, total, subTree });
    })
        .filter(item => item.get('total') > 0)
        .sort(sortTotal);
};

export const processPageDataAnalysis = (reduction, pageIndex, raw) => {
    const data = fromJS(raw);

    // tree data
    const cost = getCost(data.get('cost'));
    const costTotal = addTotal(cost);
    const items = map({}); // TODO
    const description = data.get('description');

    // block data
    const treeVisible = reduction.getIn(['appState', 'other', 'analysis', 'treeVisible']);
    const blocks = getBlocks(cost, treeVisible);

    return reduction
        .setIn(['appState', 'other', 'blockView', 'blocks'], blocks)
        .setIn(['appState', 'pages', pageIndex], map({
            cost, costTotal, items, description
        }));
};

export const reloadAnalysis = (reduction, newReduction) => {
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
};

export const rAnalysisChangePeriod = (reduction, period) => {
    return reloadAnalysis(reduction,
        reduction.setIn(['appState', 'other', 'analysis', 'period'], period));
};

export const rAnalysisChangeGrouping = (reduction, grouping) => {
    return reloadAnalysis(reduction,
        reduction.setIn(['appState', 'other', 'analysis', 'grouping'], grouping));
};

export const rAnalysisChangeTimeIndex = (reduction, timeIndex) => {
    return reloadAnalysis(reduction,
        reduction.setIn(['appState', 'other', 'analysis', 'timeIndex'], timeIndex));
};

export const rAnalysisHandleNewData = (reduction, response) => {
    const newReduction = reduction
        .setIn(['appState', 'other', 'analysis', 'loading'], false)
        .setIn(['appState', 'other', 'blockView', 'loadKey'], null)
        .setIn(['appState', 'other', 'blockView', 'status'], '');

    const deep = !!response.deepBlock;
    if (deep) {
        const cost = getCost(fromJS(response.data.data.items));
        const blocks = getBlocks(cost);
        return newReduction
            .setIn(['appState', 'other', 'blockView', 'blocks'], blocks)
            .setIn(['appState', 'other', 'blockView', 'deep'], response.deepBlock);
    }

    return processPageDataAnalysis(newReduction, pageIndexAnalysis, response.data.data);
};

export const rAnalysisTreeToggleDisplay = (reduction, key) => {
    const treeVisible = reduction.getIn(['appState', 'other', 'analysis', 'treeVisible']);
    const newStatus = treeVisible.has(key) ? !treeVisible.get(key) : false;

    const cost = reduction.getIn(['appState', 'pages', pageIndexAnalysis, 'cost']);
    const blocks = getBlocks(cost, treeVisible.set(key, newStatus));

    return reduction.setIn(['appState', 'other', 'analysis', 'treeVisible', key], newStatus)
        .setIn(['appState', 'other', 'blockView', 'blocks'], blocks)
        .setIn(['appState', 'other', 'blockView', 'active'], null);
};
export const rAnalysisTreeToggleExpand = (reduction, key) => {
    const treeOpen = reduction.getIn(['appState', 'other', 'analysis', 'treeOpen']);
    const newStatus = treeOpen.has(key) ? !treeOpen.get(key) : true;

    return reduction.setIn(['appState', 'other', 'analysis', 'treeOpen', key], newStatus);
};
export const rAnalysisTreeHover = (reduction, key) => {
    return reduction.setIn(['appState', 'other', 'blockView', 'active'], key);
};
export const rAnalysisBlockClick = (reduction, name) => {
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
};

