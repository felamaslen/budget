const test = require('ava');
const {
    processStocks
} = require('~api/src/routes/data/stocks');

test('processStocks returns valid results', t => {
    const queryResult = [
        { code: 'ABC:DEF', name: 'ABC company', 'sum_weight': 2 },
        { code: 'XYZ:UVW', name: 'XYZ company', 'sum_weight': 4 }
    ];

    t.deepEqual(processStocks(queryResult, 'fookey'), {
        stocks: [
            ['ABC:DEF', 'ABC company', 2],
            ['XYZ:UVW', 'XYZ company', 4]
        ],
        total: 6,
        apiKey: 'fookey'
    });
});

