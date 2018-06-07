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

function processPageData(state, { page, raw }, now) {
    if (page === 'overview') {
        // overview
        return processPageDataOverview(state, { raw });
    }

    if (page === 'analysis') {
        // analysis
        return processPageDataAnalysis(state, { raw });
    }

    if (page === 'funds') {
        // funds
        return processPageDataFunds(state, { raw }, now);
    }

    if (PAGES[page].list) {
        const nextState = processPageDataList(state, { page, raw });
        const { sortedRows, rowIds } = sortRowsByDate(
            nextState.getIn(['pages', page, 'rows']), page);
        const weeklyData = addWeeklyAverages(
            nextState.getIn(['pages', page, 'data']), sortedRows, page);

        return nextState
            .setIn(['pages', page, 'rows'], sortedRows)
            .setIn(['pages', page, 'rowIds'], rowIds)
            .setIn(['pages', page, 'data'], weeklyData);
    }

    return state;
}

export function rContentBlockHover(state, { block, subBlock }) {
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

    return state.setIn(['other', 'blockView', 'status'], newStatus);
}

export function rRequestContent(state, { page }) {
    const loaded = state.getIn(['pagesLoaded', page]);
    const loading = !(loaded && page !== 'analysis');

    return state
        .set('loading', loading)
        .set('currentPage', page);
}

export function rHandleContentResponse(state, { response, page }, now) {
    if (!response) {
        return state.set('loading', false);
    }

    return processPageData(
        state.setIn(['pagesRaw', page], response.data.data),
        { page, raw: response.data.data },
        now
    )
        .set('loading', false)
        .setIn(['pagesLoaded', page], true)
        .setIn(['edit', 'active'], getNullEditable(page))
        .setIn(['edit', 'add', page], getAddDefaultValues(page));
}

export const rSetPage = (state, { page }) => state.set('currentPage', page);

