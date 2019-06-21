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
    testPricesQueryResponse,
    testTransactionsQueryResponse
};
