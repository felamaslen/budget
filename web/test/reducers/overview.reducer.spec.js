import test from 'ava';
import { fromJS } from 'immutable';
import { DateTime } from 'luxon';
import {
    rCalculateOverview,
    processPageDataOverview
} from '~client/reducers/overview.reducer';

const state = fromJS({
    now: DateTime.fromISO('2018-03-23T11:45:20Z'),
    pages: {
        overview: {
            startDate: DateTime.fromISO('2018-01-31T23:59:59.999Z'),
            endDate: DateTime.fromISO('2018-06-30T23:59:59.999Z'),
            cost: {
                old: [10000, 11500, 11200],
                funds: [94, 105, 110, 100, 101, 102, 103, 0, 0, 0],
                fundChanges: [0, 0, 1, 0, 0, 1, 1, 0, 0, 0],
                income: [2000, 1900, 1500, 2500, 2300, 1800, 2600],
                bills: [1000, 900, 400, 650, 0, 0, 0],
                food: [50, 13, 20, 19, 0, 0, 0],
                general: [150, 90, 10, 35, 0, 0, 0],
                holiday: [10, 1000, 95, 13, 0, 0, 0],
                social: [50, 65, 134, 10, 0, 0, 0]
            },
            rows: [
                [100],
                [105],
                [913],
                [239],
                [0],
                [0],
                [0]
            ]
        }
    }
});

test('rCalculateOverview handling adding income', t => {
    const result = rCalculateOverview({
        page: 'income',
        newDate: DateTime.fromISO('2018-04-24T10:00:11Z'),
        oldDate: DateTime.fromISO('2018-04-24T10:00:11Z'),
        newItemCost: 87054,
        oldItemCost: 0
    })(state);

    t.is(result.getIn(['pages', 'overview', 'cost', 'income', 3]), 2500 + 87054);
});

test('rCalculateOverview handling changing dates', t => {
    const result = rCalculateOverview({
        page: 'food',
        newDate: DateTime.fromISO('2018-01-11T10:00:11Z'),
        oldDate: DateTime.fromISO('2018-03-18T10:00:11Z'),
        newItemCost: 19,
        oldItemCost: 19
    })(state);

    t.is(result.getIn(['pages', 'overview', 'cost', 'food', 0]), 50 + 19);

    t.is(result.getIn(['pages', 'overview', 'cost', 'food', 2]), 20 - 19);
});

test('processPageDataOverview inserting a simple map from the raw response', t => {
    const raw = {
        startYearMonth: [2018, 1],
        endYearMonth: [2018, 6],
        cost: {
            balance: [13502, 19220, 11876, 14981, 14230, 12678],
            old: [10000, 11500, 11200],
            funds: [94, 105, 110, 100, 101, 102, 103, 0, 0, 0],
            fundChanges: [0, 0, 1, 0, 0, 1, 1, 0, 0, 0],
            income: [2000, 1900, 1500, 2500, 2300, 1800, 2600],
            bills: [1000, 900, 400, 650, 0, 0, 0],
            food: [50, 13, 20, 19, 0, 0, 0],
            general: [150, 90, 10, 35, 0, 0, 0],
            holiday: [10, 1000, 95, 13, 0, 0, 0],
            social: [50, 65, 134, 10, 0, 0, 0]
        }
    };

    const state1 = fromJS({
        now: DateTime.fromISO('2018-03-23T11:45:20Z'),
        pages: {}
    });

    const result = processPageDataOverview(state1, { raw });

    t.deepEqual(result.toJS(), {
        now: DateTime.fromISO('2018-03-23T11:45:20Z'),
        pages: {
            overview: {
                startDate: DateTime.fromISO('2018-01-31T23:59:59.999Z'),
                endDate: DateTime.fromISO('2018-06-30T22:59:59.999Z'),
                cost: {
                    old: [10000, 11500, 11200],
                    funds: [94, 105, 110, 100, 101, 102, 103, 0, 0, 0],
                    fundChanges: [0, 0, 1, 0, 0, 1, 1, 0, 0, 0],
                    income: [2000, 1900, 1500, 2500, 2300, 1800, 2600],
                    bills: [1000, 900, 400, 650, 0, 0, 0],
                    food: [50, 13, 20, 19, 0, 0, 0],
                    general: [150, 90, 10, 35, 0, 0, 0],
                    holiday: [10, 1000, 95, 13, 0, 0, 0],
                    social: [50, 65, 134, 10, 0, 0, 0]
                },
                rows: [[13502], [19220], [11876], [14981], [14230], [12678]]
            }
        }
    });
});
