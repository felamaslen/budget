/*
 * Carries out actions for the content component
 */

import { PAGES, LIST_PAGES } from '../misc/const';
import {
    getNullEditable, getAddDefaultValues, sortRowsByDate, addWeeklyAverages
} from '../misc/data';
import { capitalise, formatCurrency } from '../misc/format';

import { processPageDataOverview } from './overview.reducer';
import { processPageDataList, processPageDataFunds } from './list.reducer';
import { processPageDataAnalysis } from './analysis.reducer';

function processPageData(reduction, { pageIndex, raw }, now) {
    if (PAGES[pageIndex] === 'overview') {
        // overview
        return processPageDataOverview(reduction, { pageIndex, raw });
    }

    if (PAGES[pageIndex] === 'analysis') {
        // analysis
        return processPageDataAnalysis(reduction, { pageIndex, raw });
    }

    if (PAGES[pageIndex] === 'funds') {
        // funds
        return processPageDataFunds(reduction, { pageIndex, raw }, now);
    }

    if (LIST_PAGES.indexOf(pageIndex) > -1) {
        const newReduction = processPageDataList(reduction, { pageIndex, raw });
        const sortedRows = sortRowsByDate(
            newReduction.getIn(['pages', pageIndex, 'rows']), pageIndex
        );
        const weeklyData = addWeeklyAverages(
            newReduction.getIn(['pages', pageIndex, 'data']), sortedRows, pageIndex
        );

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

export function rRequestContent(reduction, { pageIndex, loading }) {
    return reduction
        .set('loading', loading)
        .set('currentPageIndex', pageIndex);
}

export function rHandleContentResponse(reduction, { response, pageIndex }, now) {
    if (!response) {
        return reduction.set('loading', false);
    }

    return processPageData(
        reduction
            .setIn(['pagesRaw', pageIndex], response.data.data),
        { pageIndex, raw: response.data.data },
        now
    )
        .set('loading', false)
        .setIn(['pagesLoaded', pageIndex], true)
        .setIn(['edit', 'active'], getNullEditable(pageIndex))
        .setIn(['edit', 'add', pageIndex], getAddDefaultValues(pageIndex));
}

