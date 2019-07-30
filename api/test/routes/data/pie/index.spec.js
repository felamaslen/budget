const test = require('ava');

const {
    getPieCols,
    processQueryResult
} = require('~api/routes/data/pie');

test('getPieCols returns the expected category list', t => {
    t.deepEqual(getPieCols('funds'), [
        ['item', 'cost', 'Total']
    ]);

    t.deepEqual(getPieCols('food'), [
        ['shop', 'cost', 'Shop cost'],
        ['category', 'cost', 'Category cost']
    ]);

    t.deepEqual(getPieCols('general'), [
        ['shop', 'cost', 'Shop cost'],
        ['category', 'cost', 'Category cost']
    ]);

    t.deepEqual(getPieCols('social'), [
        ['shop', 'cost', 'Shop cost'],
        ['society', 'cost', 'Society cost']
    ]);

    t.deepEqual(getPieCols('holiday'), [
        ['shop', 'cost', 'Shop cost'],
        ['holiday', 'cost', 'Holiday cost']
    ]);
});

test('processQueryResult returns results', t => {
    const queryResult = [
        { col: 'Tesco', cost: 41739 },
        { col: 'Sainsburys', cost: 20490 },
        { col: 'Subway', cost: 15647 },
        { col: 'Wetherspoons', cost: 6982 },
        { col: 'Waitrose', cost: 120 },
        { col: 'Boots', cost: 99 }
    ];

    const pieCol = ['shop', 'cost', 'Shop cost'];

    const threshold = 0.05;

    const result = processQueryResult(queryResult, pieCol, threshold);

    const expectedResult = {
        title: 'Shop cost',
        type: 'cost',
        total: 85077,
        data: [
            ['Tesco', 41739],
            ['Sainsburys', 20490],
            ['Subway', 15647],
            ['Wetherspoons', 6982],
            ['Other', 219]
        ]
    };

    t.deepEqual(result, expectedResult);
});
