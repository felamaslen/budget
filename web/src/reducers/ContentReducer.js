/*
 * Carries out actions for the content component
 */

import {
    PAGES, LIST_PAGES, ANALYSIS_PERIODS, ANALYSIS_GROUPINGS, GRAPH_FUNDS_PERIODS
} from '../misc/const';
import {
    getPeriodMatch,
    getNullEditable, getAddDefaultValues, sortRowsByDate, addWeeklyAverages
} from '../misc/data';
import { capitalise, formatCurrency } from '../misc/format';

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

export function rContentBlockHover(reduction, { block, subBlock }) {
    let newStatus = '';
    const haveSubBlock = Boolean(subBlock);
    if (block) {
        const theBlock = haveSubBlock
            ? subBlock
            : block;

        const value = formatCurrency(theBlock.get('value'), { raw: true });

        newStatus = haveSubBlock
            ? `${capitalise(block.get('name'))}: ${subBlock.get('name')} (${value})`
            : `${capitalise(block.get('name'))} (${value})`;
    }

    return reduction.setIn(['other', 'blockView', 'status'], newStatus);
}

export function rRequestContent(reduction, { pageIndex }) {
    return reduction
        .set('loading', true)
        .set('currentPageIndex', pageIndex);
}

export function rHandleContentResponse(reduction, { response, pageIndex }) {
    if (!response) {
        return reduction.set('loading', false);
    }

    return processPageData(
        reduction
            .setIn(['pagesRaw', pageIndex], response.data.data),
        pageIndex,
        response.data.data
    )
        .set('loading', false)
        .setIn(['pagesLoaded', pageIndex], true)
        .setIn(['edit', 'active'], getNullEditable(pageIndex))
        .setIn(['edit', 'add'], getAddDefaultValues(pageIndex));
}

