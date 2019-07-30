import test from 'ava';
import { DateTime } from 'luxon';
import db from '~api/modules/db';
import {
    getPeriodCostDeep,
    processDataResponse
} from '~api/routes/data/analysis/deep';

test('getPeriodCostDeep getting items data with cost', async t => {
    const [{ uid }] = await db.select('uid')
        .from('users')
        .where('name', '=', 'test-user');

    const ids = await db.insert([
        { uid, date: '2017-09-01', item: 'Flour', category: 'Bread', cost: 80, shop: '' },
        { uid, date: '2017-09-03', item: 'Eggs', category: 'Dairy', cost: 10, shop: '' },
        { uid, date: '2017-09-02', item: 'Eggs', category: 'Dairy', cost: 120, shop: '' }
    ])
        .returning('id')
        .into('food');

    const user = { uid };
    const now = DateTime.fromISO('2017-09-04');
    const category = 'food';
    const period = 'month';
    const groupBy = 'category';
    const pageIndex = 0;

    const params = { period, groupBy, pageIndex, category };

    const result = await getPeriodCostDeep(db, user, now, params);

    const expectedResult = [
        { cost: 80, item: 'Flour', itemCol: 'Bread' },
        { cost: 130, item: 'Eggs', itemCol: 'Dairy' }
    ];

    t.deepEqual(result, expectedResult);

    await db('food')
        .whereIn('id', ids)
        .del();
});

test('processDataResponse processing query response properly', t => {
    const queryResponse = [
        { cost: 80, item: 'Flour', itemCol: 'Bread' },
        { cost: 95, item: 'Milk', itemCol: 'Dairy' },
        { cost: 130, item: 'Eggs', itemCol: 'Dairy' }
    ];

    const expectedResult = [
        [
            'Bread',
            [
                ['Flour', 80]
            ]
        ],
        [
            'Dairy',
            [
                ['Milk', 95],
                ['Eggs', 130]
            ]
        ]
    ];

    t.deepEqual(processDataResponse(queryResponse), expectedResult);
});
