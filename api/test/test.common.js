const knex = require('knex');
const memoize = require('fast-memoize');
const md5 = require('md5');

const config = require('~api/src/config')();

const getDate = (date, nativeDates) => {
    if (nativeDates) {
        return new Date(date);
    }

    return date;
};

const generateFunds = async (db, nativeDates) => {
    await db.insert([
        { cid: 5, time: '2017-09-30 17:01:01', done: true },
        { cid: 4, time: '2017-09-01 17:01:01', done: true },
        { cid: 3, time: '2017-08-31 17:01:02', done: true },
        { cid: 2, time: '2016-12-03 11:30:00', done: false },
        { cid: 1, time: '2016-11-07 06:26:40', done: true }
    ])
        .into('fund_cache_time');

    await db.insert([
        { cid: 4, fid: 1, price: 124.04 },
        { cid: 4, fid: 2, price: 95.49 },
        { cid: 4, fid: 3, price: 49.52 },
        { cid: 3, fid: 1, price: 123 },
        { cid: 3, fid: 2, price: 100 },
        { cid: 3, fid: 3, price: 50.97 },
        { cid: 2, fid: 1, price: 121.99 },
        { cid: 2, fid: 2, price: 99.13 },
        { cid: 2, fid: 3, price: 56.01 },
        { cid: 1, fid: 2, price: 95.3 }
    ])
        .into('fund_cache');

    await db.insert([
        { fid: 1, broker: 'hl', hash: md5(`fund1${config.data.funds.salt}`) },
        { fid: 2, broker: 'hl', hash: md5(`fund2${config.data.funds.salt}`) },
        { fid: 3, broker: 'hl', hash: md5(`fund3${config.data.funds.salt}`) }
    ])
        .into('fund_hash');

    await db.insert([
        { id: 11, uid: 1, item: 'fund1' },
        { id: 1, uid: 1, item: 'fund2' },
        { id: 3, uid: 1, item: 'fund3' }
    ])
        .into('funds');

    await db.insert([
        { fundId: 3, date: getDate('2016-09-19', nativeDates), units: 1678.42, cost: 200000 },
        { fundId: 3, date: getDate('2017-02-14', nativeDates), units: 846.38, cost: 100000 },
        { fundId: 11, date: getDate('2016-08-24', nativeDates), units: 89.095, cost: 100000 },
        { fundId: 11, date: getDate('2016-09-19', nativeDates), units: 894.134, cost: 100000 },
        { fundId: 11, date: getDate('2017-04-27', nativeDates), units: -883.229, cost: -90000 }
    ])
        .into('funds_transactions');

};

const generateListData = async (db, nativeDates) => {
    await db.insert([
        { uid: 1, date: getDate('2018-03-24', nativeDates), item: 'Salary', cost: 433201 }
    ])
        .into('income');

    await db.insert([
        { uid: 1, date: getDate('2018-03-25', nativeDates), item: 'Rent', cost: 72500 },
        { uid: 1, date: getDate('2018-03-25', nativeDates), item: 'Electricity', cost: 3902 }
    ])
        .into('bills');

    await db.insert([
        { uid: 1, date: getDate('2018-03-25', nativeDates), shop: '', category: 'Food', item: 'Breakfast', cost: 19239 },
        { uid: 1, date: getDate('2018-03-25', nativeDates), shop: '', category: 'Food', item: 'Lunch', cost: 91923 },
        { uid: 1, date: getDate('2018-03-25', nativeDates), shop: '', category: 'Snacks', item: 'Nuts', cost: 2239 }
    ])
        .into('food');

    await db.insert([
        { uid: 1, date: getDate('2018-03-25', nativeDates), shop: '', category: 'Foo', item: 'Kitchen', cost: 1231 },
        { uid: 1, date: getDate('2018-03-25', nativeDates), shop: '', category: 'Foo', item: 'Household', cost: 9912 }
    ])
        .into('general');

    await db.insert([
        { uid: 1, date: getDate('2018-03-25', nativeDates), shop: '', holiday: 'a country', item: 'Somewhere', cost: 11023 },
        { uid: 1, date: getDate('2018-03-25', nativeDates), shop: '', holiday: 'a country', item: 'Otherplace', cost: 23991 }
    ])
        .into('holiday');

    await db.insert([
        { uid: 1, date: getDate('2018-03-25', nativeDates), shop: '', society: 'Bar', item: 'Friends', cost: 61923 }
    ])
        .into('social');
};

const prepareMockDb = memoize(async (nativeDates = true) => {
    const db = knex({
        client: 'sqlite',
        connection: ':memory:',
        useNullAsDefault: true
    });

    await db.migrate.latest();

    await generateFunds(db, nativeDates);
    await generateListData(db, nativeDates);

    return db;
});

const testPricesQueryResponse = [
    { time: new Date('2017-09-30 17:01:01'), id: '11,1,3', price: '124.04,95.49,49.52' },
    { time: new Date('2017-09-01 17:01:01'), id: '11,1,3', price: '100,123,50.97' },
    { time: new Date('2017-08-31 17:01:02'), id: '1,11,3', price: '121,99.13,56.01' },
    { time: new Date('2016-11-07 06:26:40'), id: '11', price: '95.3' }
];

const testTransactionsQueryResponse = [
    { id: 3, date: new Date('2016-09-19'), units: 1678.42, cost: 200000 },
    { id: 3, date: new Date('2017-02-14'), units: 846.38, cost: 100000 },
    { id: 11, date: new Date('2016-08-24'), units: 89.095, cost: 10000 },
    { id: 11, date: new Date('2016-09-19'), units: 894.134, cost: 100000 },
    { id: 11, date: new Date('2017-04-27'), units: -883.229, cost: -90000 }
];

module.exports = {
    prepareMockDb,
    testPricesQueryResponse,
    testTransactionsQueryResponse
};

