/**
 * Process overview data
 */

import { List as list, Map as map, fromJS } from 'immutable';
import { compose } from 'redux';
import { DateTime } from 'luxon';
import { getLoadedStatus } from '../selectors/app';
import { getRowDates } from '../selectors/overview';

function getUpdatedCostMap(cost, dates, req) {
    const { page, newDate, oldDate, newItemCost, oldItemCost } = req;

    const getKeyFromDate = date => dates.findIndex(item => date.hasSame(item, 'month'));

    const newKey = getKeyFromDate(newDate);
    const oldKey = getKeyFromDate(oldDate);

    const setCost = (key, diff) => costMap => {
        if (key > -1) {
            return costMap.setIn([page, key], costMap.getIn([page, key]) + diff);
        }

        return costMap;
    };

    return compose(
        setCost(oldKey, -oldItemCost),
        setCost(newKey, +newItemCost)
    )(cost);
}

export function rCalculateOverview(req) {
    return state => {
        if (!getLoadedStatus(state, { page: 'overview' })) {
            return state;
        }

        const cost = state.getIn(['pages', 'overview', 'cost']);
        const dates = getRowDates(state);

        return state.setIn(['pages', 'overview', 'cost'], getUpdatedCostMap(cost, dates, req));
    };
}

export function processPageDataOverview(state, { raw }) {
    const {
        startYearMonth: [startYear, startMonth],
        endYearMonth: [endYear, endMonth],
        cost: costRaw
    } = raw;

    const startDate = DateTime.fromObject({ year: startYear, month: startMonth }).endOf('month');
    const endDate = DateTime.fromObject({ year: endYear, month: endMonth }).endOf('month');

    const { months: monthDiff } = endDate.diff(startDate, 'months').toObject();

    const numRows = Math.round(monthDiff) + 1;
    const numCols = 1;

    const { balance, ...otherCost } = costRaw;

    return state.setIn(['pages', 'overview'], map({
        startDate,
        endDate,
        cost: fromJS(otherCost),
        rows: list(balance).map(value => list.of(value)),
        data: map({ numRows, numCols })
    }));
}

