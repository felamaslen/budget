import test from 'ava';
import { DateTime } from 'luxon';

import reducer, { initialState } from '~client/reducers/overview';

import { dataRead } from '~client/actions/api';
import {
    listItemCreated,
    listItemUpdated,
    listItemDeleted
} from '~client/actions/list';
import { loggedOut } from '~client/actions/login';

test('Null action returns the initial state', t => {
    t.deepEqual(reducer(undefined, null), initialState);
});

test('LOGGED_OUT resets the state', t => {
    t.deepEqual(reducer(undefined, loggedOut()), initialState);
});

test('DATA_READ sets overview data', t => {
    const state = {
    };

    const action = dataRead({
        overview: {
            startYearMonth: [2019, 4],
            endYearMonth: [2019, 7],
            currentYear: 2019,
            currentMonth: 7,
            futureMonths: 12,
            cost: {
                funds: [0, 0, 510000, 2160465],
                fundChanges: [1, 1, 0, 1],
                income: [0, 30040, 229838, 196429],
                bills: [99778, 101073, 118057, 212450],
                food: [11907, 24108, 28123, 38352],
                general: [12192, 9515, 28335, 160600],
                holiday: [46352, 0, 47398, 55597],
                social: [13275, 12593, 12400, 8115],
                balance: [1672664, 7532442, 8120445, 0],
                old: [488973, 434353, 1234689]
            }
        }
    });

    const result = reducer(state, action);

    t.deepEqual(result.startDate, DateTime.fromISO('2019-04-30T23:59:59.999Z'));
    t.deepEqual(result.endDate, DateTime.fromISO('2019-07-31T23:59:59.999Z'));
    t.deepEqual(result.cost, {
        funds: [0, 0, 510000, 2160465],
        fundChanges: [1, 1, 0, 1],
        income: [0, 30040, 229838, 196429],
        bills: [99778, 101073, 118057, 212450],
        food: [11907, 24108, 28123, 38352],
        general: [12192, 9515, 28335, 160600],
        holiday: [46352, 0, 47398, 55597],
        social: [13275, 12593, 12400, 8115],
        old: [488973, 434353, 1234689]
    });
    t.deepEqual(result.rows, [
        [1672664],
        [7532442],
        [8120445],
        [0]
    ]);
});

test('LIST_ITEM_CREATED adds to the relevant month and category', t => {
    const state = {
        startDate: DateTime.fromISO('2019-04-30T23:59:59.999Z'),
        endDate: DateTime.fromISO('2019-07-31T23:59:59.999Z'),
        cost: {
            funds: [0, 0, 510000, 2160465],
            fundChanges: [1, 1, 0, 1],
            income: [0, 30040, 229838, 196429],
            bills: [99778, 101073, 118057, 212450],
            food: [11907, 24108, 28123, 38352],
            general: [12192, 9515, 28335, 160600],
            holiday: [46352, 0, 47398, 55597],
            social: [13275, 12593, 12400, 8115],
            old: [488973, 434353, 1234689]
        },
        rows: [[1672664], [7532442], [8120445], [0]]
    };

    const withGeneral = reducer(state, listItemCreated('general', {
        date: DateTime.fromISO('2019-06-02T00:00:00.000Z'),
        cost: 34
    }));

    t.is(withGeneral.cost.general[2], 28335 + 34);
});

test('LIST_ITEM_CREATED is ignored if the item has insufficient data', t => {
    const state = {
        startDate: DateTime.fromISO('2019-04-30T23:59:59.999Z'),
        endDate: DateTime.fromISO('2019-07-31T23:59:59.999Z'),
        cost: {
            funds: [0, 0, 510000, 2160465],
            fundChanges: [1, 1, 0, 1],
            income: [0, 30040, 229838, 196429],
            bills: [99778, 101073, 118057, 212450],
            food: [11907, 24108, 28123, 38352],
            general: [12192, 9515, 28335, 160600],
            holiday: [46352, 0, 47398, 55597],
            social: [13275, 12593, 12400, 8115],
            old: [488973, 434353, 1234689]
        },
        rows: [[1672664], [7532442], [8120445], [0]]
    };

    const withMissingDate = reducer(state, listItemCreated('general', {
        cost: 34
    }));

    t.deepEqual(withMissingDate, state);

    const withMissingCost = reducer(state, listItemCreated('general', {
        date: DateTime.fromISO('2019-06-02T00:00:00.000Z')
    }));

    t.deepEqual(withMissingCost, state);
});

test('LIST_ITEM_UPDATED updates the relevant month and category', t => {
    const state = {
        startDate: DateTime.fromISO('2019-04-30T23:59:59.999Z'),
        endDate: DateTime.fromISO('2019-07-31T23:59:59.999Z'),
        cost: {
            funds: [0, 0, 510000, 2160465],
            fundChanges: [1, 1, 0, 1],
            income: [0, 30040, 229838, 196429],
            bills: [99778, 101073, 118057, 212450],
            food: [11907, 24108, 28123, 38352],
            general: [12192, 9515, 28335, 160600],
            holiday: [46352, 0, 47398, 55597],
            social: [13275, 12593, 12400, 8115],
            old: [488973, 434353, 1234689]
        },
        rows: [[1672664], [7532442], [8120445], [0]]
    };

    const withDate = reducer(state, listItemUpdated('food', 'some-id', {
        date: DateTime.fromISO('2019-06-02T00:00Z'),
        cost: 34
    }, {
        date: DateTime.fromISO('2019-05-10T00:00Z'),
        cost: 34
    }));

    t.is(withDate.cost.food[1], 24108 - 34);
    t.is(withDate.cost.food[2], 28123 + 34);

    const withCost = reducer(state, listItemUpdated('food', 'some-id', {
        date: DateTime.fromISO('2019-06-02T00:00Z'),
        cost: 98
    }, {
        date: DateTime.fromISO('2019-06-02T00:00Z'),
        cost: 34
    }));

    t.is(withCost.cost.food[2], 28123 + 98 - 34);

    const withBoth = reducer(state, listItemUpdated('food', 'some-id', {
        date: DateTime.fromISO('2019-06-02T00:00Z'),
        cost: 98
    }, {
        date: DateTime.fromISO('2019-04-24T00:00Z'),
        cost: 34
    }));

    t.is(withBoth.cost.food[0], 11907 - 34);
    t.is(withBoth.cost.food[2], 28123 + 98);
});

test('LIST_ITEM_DELETED removes from the relevant month and category', t => {
    const state = {
        startDate: DateTime.fromISO('2019-04-30T23:59:59.999Z'),
        endDate: DateTime.fromISO('2019-07-31T23:59:59.999Z'),
        cost: {
            funds: [0, 0, 510000, 2160465],
            fundChanges: [1, 1, 0, 1],
            income: [0, 30040, 229838, 196429],
            bills: [99778, 101073, 118057, 212450],
            food: [11907, 24108, 28123, 38352],
            general: [12192, 9515, 28335, 160600],
            holiday: [46352, 0, 47398, 55597],
            social: [13275, 12593, 12400, 8115],
            old: [488973, 434353, 1234689]
        },
        rows: [[1672664], [7532442], [8120445], [0]]
    };

    const withHoliday = reducer(state, listItemDeleted('some-id', { page: 'holiday' }, {
        date: DateTime.fromISO('2019-07-12T00:00Z'),
        cost: 1235
    }));

    t.is(withHoliday.cost.holiday[3], 55597 - 1235);
});
