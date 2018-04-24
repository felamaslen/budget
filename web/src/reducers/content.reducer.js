/*
 * Carries out actions for the content component
 */

import { PAGES } from '../constants/data';
import {
    getNullEditable, getAddDefaultValues, sortRowsByDate, addWeeklyAverages
} from '../helpers/data';
import { capitalise, formatCurrency } from '../helpers/format';
import { processPageDataOverview } from './overview.reducer';
import { processPageDataList, processPageDataFunds } from './list.reducer';
import { processPageDataAnalysis } from './analysis.reducer';

function processPageData(reduction, { page, raw }, now) {
    if (page === 'overview') {
        // overview
        return processPageDataOverview(reduction, { raw });
    }

    if (page === 'analysis') {
        // analysis
        return processPageDataAnalysis(reduction, { raw });
    }

    if (page === 'funds') {
        // funds
        return processPageDataFunds(reduction, { raw }, now);
    }

    if (PAGES[page].list) {
        const newReduction = processPageDataList(reduction, { page, raw });
        const { sortedRows, rowIds } = sortRowsByDate(
            newReduction.getIn(['pages', page, 'rows']), page);
        const weeklyData = addWeeklyAverages(
            newReduction.getIn(['pages', page, 'data']), sortedRows, page);

        return newReduction
            .setIn(['pages', page, 'rows'], sortedRows)
            .setIn(['pages', page, 'rowIds'], rowIds)
            .setIn(['pages', page, 'data'], weeklyData);
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

export function rRequestContent(reduction, { page }) {
    const loaded = reduction.getIn(['pagesLoaded', page]);
    const loading = !(loaded && page !== 'analysis');

    return reduction
        .set('loading', loading)
        .set('currentPage', page);
}

export function rHandleContentResponse(reduction, { response, page }, now) {
    if (!response) {
        return reduction.set('loading', false);
    }

    return processPageData(
        reduction.setIn(['pagesRaw', page], response.data.data),
        { page, raw: response.data.data },
        now
    )
        .set('loading', false)
        .setIn(['pagesLoaded', page], true)
        .setIn(['edit', 'active'], getNullEditable(page))
        .setIn(['edit', 'add', page], getAddDefaultValues(page));
}

export const rSetPage = (reduction, { page }) => reduction.set('currentPage', page);

