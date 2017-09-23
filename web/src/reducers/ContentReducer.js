/*
 * Carries out actions for the content component
 */

import { List as list, Map as map } from 'immutable';
import { rErrorMessageOpen } from './ErrorReducer';
import {
    ERROR_LEVEL_WARN,
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
        ['other', 'analysis', 'period']
    )];

    const grouping = ANALYSIS_GROUPINGS[reduction.getIn(['other', 'analysis', 'grouping'])];
    const timeIndex = reduction.getIn(['other', 'analysis', 'timeIndex']);

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

/**
 * Processes response data into output fit for consumption by the view
 * @param {Record} reduction: app state
 * @param {integer} pageIndex: page index
 * @param {object} data: response data
 * @returns {map}: page data for view
 */
function processPageData(reduction, pageIndex, data) {
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
            newReduction.getIn(['pages', pageIndex, 'rows']), pageIndex);
        const weeklyData = addWeeklyAverages(
            newReduction.getIn(['pages', pageIndex, 'data']), sortedRows, pageIndex);

        return newReduction
            .setIn(['pages', pageIndex, 'rows'], sortedRows)
            .setIn(['pages', pageIndex, 'data'], weeklyData);
    }

    return reduction;
}

export function rHandleContentResponse(reduction, req) {
    return processPageData(
        reduction
            .setIn(['pagesRaw', req.pageIndex], req.response.data.data),
        req.pageIndex,
        req.response.data.data
    )
        .set('loading', false)
        .setIn(['pagesLoaded', req.pageIndex], true)
        .setIn(['edit', 'active'], getNullEditable(req.pageIndex))
        .setIn(['edit', 'add'], getAddDefaultValues(req.pageIndex));
}

export function rRequestContent(reduction, pageIndex) {
    return reduction
        .set('loading', true)
        .set('currentPageIndex', pageIndex);
}

export function rContentBlockHover (reduction, obj) {
    let newStatus = '';
    const haveSubBlock = Boolean(obj.subBlock);
    if (obj.block) {
        const theBlock = haveSubBlock
            ? obj.subBlock
            : obj.block;

        const value = formatCurrency(theBlock.get('value'), { raw: true });

        newStatus = haveSubBlock
            ? `${capitalise(obj.block.get('name'))}: ${obj.subBlock.get('name')} (${value})`
            : `${capitalise(obj.block.get('name'))} (${value})`;
    }

    return reduction.setIn(['other', 'blockView', 'status'], newStatus);
}
export function rContentUpdateBlocks(reduction, obj) {
    const loadKey = obj.loadKey;
    const currentLoadKey = reduction.getIn(['other', 'blockView', 'loadKey']);
    if (loadKey !== currentLoadKey) {
    // another load request has been made or the page has been changed
        return reduction;
    }

    if (obj.response.data.error) {
        return rErrorMessageOpen(reduction, map({
            text: `Error loading blocks: ${obj.response.data.errorMessage}`,
            level: ERROR_LEVEL_WARN
        }));
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
        .setIn(['other', 'blockView', 'blocks'], blocks);
}

