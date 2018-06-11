/*
 * Carries out actions for the content component
 */

import { compose } from 'redux';
import { PAGES } from '../constants/data';
import { getNullEditable, getAddDefaultValues, resortListRows } from '../helpers/data';
import { capitalise, formatCurrency } from '../helpers/format';
import { getNow, getLoadedStatus } from '../selectors/app';
import { processPageDataOverview } from './overview.reducer';
import { processPageDataList } from './list.reducer';
import { processPageDataFunds } from './funds.reducer';
import { processPageDataAnalysis } from './analysis.reducer';

function processPageData(state, { page, raw }) {
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
        return processPageDataFunds(state, { raw });
    }

    if (PAGES[page].list) {
        return compose(
            resortListRows(page),
            nextState => processPageDataList(nextState, { page, raw })
        )(state);
    }

    return state;
}

function getNewBlockStatus(state, { block, subBlock }) {
    if (block) {
        const theBlock = subBlock || block;

        const value = formatCurrency(theBlock.get('value'), { raw: true });

        if (subBlock) {
            return `${capitalise(block.get('name'))}: ${subBlock.get('name')} (${value})`;
        }

        return `${capitalise(block.get('name'))} (${value})`;
    }

    return '';
}

export const rContentBlockHover = (state, action) =>
    state.setIn(['other', 'blockView', 'status'], getNewBlockStatus(state, action));

export function rRequestContent(state, { page }) {
    const loaded = getLoadedStatus(state, { page });
    const loading = !(loaded && page !== 'analysis');

    return state.set('loading', loading)
        .set('currentPage', page);
}

export function rHandleContentResponse(state, { response, page }) {
    if (!(response && response.data && response.data.data)) {
        return state.set('loading', false);
    }

    const now = getNow(state);

    return processPageData(state, { page, raw: response.data.data })
        .set('loading', false)
        .setIn(['edit', 'active'], getNullEditable(page))
        .setIn(['edit', 'add', page], getAddDefaultValues(page, now));
}

export const rSetPage = (state, { page }) => state.set('currentPage', page);

