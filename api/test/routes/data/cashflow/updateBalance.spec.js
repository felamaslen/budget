import test from 'ava';
import sinon from 'sinon';

import db from '~api/modules/db';
import config from '~api/config';

import {
    updateData
} from '~api/routes/data/cashflow/updateBalance';

test('updateData updates a balance item in the database', async t => {
    const [{ uid }] = await db.select('uid')
        .from('users')
        .where('name', '=', 'test-user');

    const req = {
        body: { year: 2018, month: 5, balance: 34712 },
        user: { uid }
    };

    const res = {
        status: sinon.spy(),
        json: sinon.spy()
    };

    await updateData(config, db)(req, res);

    const [{ date, value }] = await db.select('date', 'value')
        .from('balance')
        .where('uid', '=', uid)
        .whereRaw('date_part(\'year\', date) = ?', 2018)
        .whereRaw('date_part(\'month\', date) = ?', 5);

    t.deepEqual(date, new Date('2018-05-31T00:00:00.000Z'));
    t.is(value, 34712);

    t.true(res.status.calledWith(201));

    t.true(res.json.calledWith({ success: true }));
});
