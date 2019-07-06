import { createReducerObject } from 'create-reducer-object';
import compose from 'just-compose';
import { DateTime } from 'luxon';
import memoize from 'fast-memoize';

import {
    LIST_ITEM_CREATED,
    LIST_ITEM_UPDATED,
    LIST_ITEM_DELETED
} from '~client/constants/actions/list';

import { getRowDates } from '~client/selectors/overview';
import { replaceAtIndex } from '~client/modules/data';

import { DATA_READ } from '~client/constants/actions/api';
import { LOGGED_OUT } from '~client/constants/actions/login';

export const initialState = {
    startDate: null,
    endDate: null,
    cost: {},
    rows: []
};

const onRead = (state, {
    res: {
        overview: {
            startYearMonth: [startYear, startMonth],
            endYearMonth: [endYear, endMonth],
            cost: {
                balance,
                ...cost
            }
        }
    }
}) => ({
    startDate: DateTime.fromObject({ year: startYear, month: startMonth }).endOf('month'),
    endDate: DateTime.fromObject({ year: endYear, month: endMonth }).endOf('month'),
    cost,
    rows: balance.map(value => ([value]))
});

const getStateRowDates = memoize(state => getRowDates({ overview: state }));

const getDateIndex = (state, date) => getStateRowDates(state).findIndex(item => date.hasSame(item, 'month'));

function getUpdatedCost(state, page, newItem, oldItem = { date: newItem.date, cost: 0 }) {
    if (!(newItem.date && oldItem.date)) {
        return state;
    }

    const setCost = (date, diff) => last => replaceAtIndex(
        last, getDateIndex(state, date), value => value + diff, true);

    return {
        cost: {
            ...state.cost,
            [page]: compose(
                setCost(oldItem.date, -oldItem.cost),
                setCost(newItem.date, +newItem.cost)
            )(state.cost[page])
        }
    };
}

const onCreate = (state, { page, item }) => getUpdatedCost(state, page, item);

const onUpdate = (state, { page, item, oldItem }) => getUpdatedCost(state, page, item, oldItem);

const onDelete = (state, { page, oldItem }) => getUpdatedCost(state, page, { date: oldItem.date, cost: 0 }, oldItem);

const handlers = {
    [DATA_READ]: onRead,
    [LIST_ITEM_CREATED]: onCreate,
    [LIST_ITEM_UPDATED]: onUpdate,
    [LIST_ITEM_DELETED]: onDelete,
    [LOGGED_OUT]: () => initialState
};

export default createReducerObject(handlers, initialState);
