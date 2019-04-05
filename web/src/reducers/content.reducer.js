/*
 * Carries out actions for the content component
 */

import { compose } from 'redux';
import { PAGES } from '~client/constants/data';
import { getNullEditable, getAddDefaultValues, resortListRows } from '~client/modules/data';
import { capitalise, formatCurrency } from '~client/modules/format';
import { getNow, getLoadedStatus } from '~client/selectors/app';
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
            resortListRows(page, state.get('now')),
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

export const rToggleViewSold = state => state.setIn(['other', 'viewSoldFunds'], !state.getIn(['other', 'viewSoldFunds']));

