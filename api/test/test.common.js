/**
 * Common stuff for testing
 */

const knex = require('knex');
const mockDb = require('mock-knex');

function prepareMockDb() {
    const db = knex({
        client: 'mysql2'
    });

    mockDb.mock(db);

    const tracker = mockDb.getTracker();

    return { db, tracker };
}

const testPricesQueryResponse = [
    { time: new Date('2017-09-30 17:01:01'), id: '11,1,3', price: '124.04,95.49,49.52' },
    { time: new Date('2017-09-01 17:01:01'), id: '11,1,3', price: '100,123,50.97' },
    { time: new Date('2017-08-31 17:01:02'), id: '1,11,3', price: '121,99.13,56.01' },
    { time: new Date('2016-11-07 06:26:40'), id: '11', price: '95.3' }
];

const testTransactionsQueryResponse = [
    { id: 3, transactions: '[{"cost":200000,"units":1678.42,"date":"2016-09-19"},{"cost":100000,"units":846.38,"date":"2017-02-14"}]' },
    { id: 11, transactions: '[{"cost":10000,"units":89.095,"date":"2016-08-24"},{"cost":100000,"units":894.134,"date":"2016-09-19"},{"cost":-90000,"units":-883.229,"date":"2017-04-27"}]' }
];

module.exports = {
    prepareMockDb,
    testPricesQueryResponse,
    testTransactionsQueryResponse
};

