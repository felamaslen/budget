/*
 * Carries out actions for the content component
 */

import { List as list, Map as map } from 'immutable';
import { EF_CONTENT_REQUESTED } from '../constants/effects';
import buildMessage from '../messageBuilder';
import {
    PAGES, LIST_PAGES, ANALYSIS_PERIODS, ANALYSIS_GROUPINGS, GRAPH_FUNDS_PERIODS
} from '../misc/const';
import { LIST_BLOCK_WIDTH, LIST_BLOCK_HEIGHT } from '../misc/config';
import {
    getPeriodMatch,
    getNullEditable, getAddDefaultValues, sortRowsByDate, addWeeklyAverages
} from '../misc/data';
import { BlockPacker, capitalise, formatCurrency } from '../misc/format';

import processPageDataOverview from './data/overview';
import { processPageDataList, processPageDataFunds } from './data/list';
import { processPageDataAnalysis } from './data/analysis';

export function getAnalysisReq(reduction, req) {
    const shortPeriod = ANALYSIS_PERIODS[reduction.getIn(
        ['appState', 'other', 'analysis', 'period']
    )];

    const grouping = ANALYSIS_GROUPINGS[reduction.getIn(['appState', 'other', 'analysis', 'grouping'])];
    const timeIndex = reduction.getIn(['appState', 'other', 'analysis', 'timeIndex']);

    const dataReq = [shortPeriod, grouping, timeIndex];

    return Object.assign({}, req, { dataReq });
}

export function getFundsReq(req) {
    const { period, length } = getPeriodMatch(GRAPH_FUNDS_PERIODS[0][0]);

    const urlParam = [
        { name: 'history', value: 'true' },
        { name: 'period', value: period },
        { name: 'length', value: length }
    ];

    return Object.assign({}, req, { urlParam });
}

export function getReqObj(reduction, pageIndex, apiKey) {
    const pageName = PAGES[pageIndex];
    const reqObj = { pageIndex, pageName, apiKey };

    if (pageName === 'analysis') {
        return getAnalysisReq(reduction, reqObj);
    }

    if (pageName === 'funds') {
        return getFundsReq(reqObj);
    }

    return reqObj;
}

export function rLoadContent(reduction, pageIndex) {
    if (!reduction.getIn(['appState', 'pagesLoaded', pageIndex])) {
        const apiKey = reduction.getIn(['appState', 'user', 'apiKey']);

        const reqObj = getReqObj(reduction, pageIndex, apiKey);

        return reduction.set('effects', reduction.get('effects').push(
            buildMessage(EF_CONTENT_REQUESTED, reqObj)
        ));
    }

    return reduction;
}

/**
 * Processes response data into output fit for consumption by the view
 * @param {Record} reduction: app state
 * @param {integer} pageIndex: page index
 * @param {object} data: response data
 * @returns {map}: page data for view
 */
const processPageData = (reduction, pageIndex, data) => {
    if (PAGES[pageIndex] === 'overview') {
    // overview
        return processPageDataOverview(reduction, pageIndex, data);
    }

    if (PAGES[pageIndex] === 'analysis') {
    // analysis
        return processPageDataAnalysis(reduction, pageIndex, data);
    }

    if (PAGES[pageIndex] === 'funds') {
    // funds
        return processPageDataFunds(reduction, pageIndex, data);
    }

    else if (LIST_PAGES.indexOf(pageIndex) > -1) {
        const newReduction = processPageDataList(reduction, pageIndex, data);
        const sortedRows = sortRowsByDate(
            newReduction.getIn(['appState', 'pages', pageIndex, 'rows']), pageIndex);
        const weeklyData = addWeeklyAverages(
            newReduction.getIn(['appState', 'pages', pageIndex, 'data']), sortedRows, pageIndex);

        return newReduction
            .setIn(['appState', 'pages', pageIndex, 'rows'], sortedRows)
            .setIn(['appState', 'pages', pageIndex, 'data'], weeklyData);
    }

    return reduction;
};

export const rHandleContentResponse = (reduction, output) => {
    return processPageData(
        reduction
            .setIn(['appState', 'pagesLoaded', output.pageIndex], true)
            .setIn(['appState', 'pagesRaw', output.pageIndex], output.response.data.data),
        output.pageIndex,
        output.response.data.data
    )
        .setIn(['appState', 'edit', 'active'], getNullEditable(output.pageIndex))
        .setIn(['appState', 'edit', 'add'], getAddDefaultValues(output.pageIndex));
};

export const rContentBlockHover = (reduction, obj) => {
    let newStatus = '';
    const haveSubBlock = !!obj.subBlock;
    if (obj.block) {
        const theBlock = haveSubBlock ? obj.subBlock : obj.block;
        const value = formatCurrency(theBlock.get('value'), { raw: true });
        if (haveSubBlock) {
            newStatus = `${capitalise(obj.block.get('name'))}: ${obj.subBlock.get('name')} (${value})`;
        }
        else {
            newStatus = `${capitalise(obj.block.get('name'))} (${value})`;
        }
    }
    return reduction.setIn(['appState', 'other', 'blockView', 'status'], newStatus);
};
export const rContentUpdateBlocks = (reduction, obj) => {
    const loadKey = obj.loadKey;
    const currentLoadKey = reduction.getIn(['appState', 'other', 'blockView', 'loadKey']);
    if (loadKey !== currentLoadKey) {
    // another load request has been made or the page has been changed
        return reduction;
    }

    if (obj.response.data.error) {
        return reduction; // TODO
    }

    const dataItem = obj.response.data.data.list[0];
    const blockData = list(dataItem.data).map(item => {
        return map({
            name: item[0],
            total: item[1]
        });
    });
    const packer = new BlockPacker(blockData, LIST_BLOCK_WIDTH, LIST_BLOCK_HEIGHT);
    const blocks = packer.blocks;

    return reduction
        .setIn(['appState', 'other', 'blockView', 'blocks'], blocks);
};

