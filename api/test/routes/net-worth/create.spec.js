const test = require('ava');

const {
    getValueRow,
    getFxValueRow
} = require('../../../src/routes/net-worth/create');

test('getValueRow converts simple numeric values', t => {
    const netWorthId = 3;
    const values = [
        {
            subcategory: 13,
            value: 364987
        }
    ];

    const result = values.map(getValueRow(netWorthId));

    t.deepEqual(result, [
        { 'net_worth_id': 3, skip: null, subcategory: 13, value: 364987 }
    ]);
});

test('getValueRow converts currency-based values', t => {
    const netWorthId = 4;
    const values = [
        {
            subcategory: 7,
            value: 364987
        },
        {
            subcategory: 13,
            value: [
                { currency: 'EUR', value: 56.728 },
                { currency: 'CZK', value: 37.20 }
            ]
        }
    ];

    const result = values.map(getValueRow(netWorthId));

    t.deepEqual(result, [
        { 'net_worth_id': 4, skip: null, subcategory: 7, value: 364987 },
        { 'net_worth_id': 4, skip: null, subcategory: 13, value: null }
    ]);
});

test('getValueRow converts mixed simple and currency-based values', t => {
    const netWorthId = 5;
    const values = [
        {
            subcategory: 17,
            value: 364987
        },
        {
            subcategory: 21,
            value: [
                { currency: 'USD', value: 173.20 },
                256,
                11
            ]
        }
    ];

    const result = values.map(getValueRow(netWorthId));

    t.deepEqual(result, [
        { 'net_worth_id': 5, skip: null, subcategory: 17, value: 364987 },
        { 'net_worth_id': 5, skip: null, subcategory: 21, value: 267 }
    ]);
});

test('getFxValueRow returns the relevant FX value rows', t => {
    const netWorthId = 5;
    const values = [
        {
            subcategory: 17,
            value: 364987
        },
        {
            subcategory: 11,
            value: [
                { currency: 'EUR', value: 56.728 },
                { currency: 'CZK', value: 37.20 }
            ]
        },
        {
            subcategory: 21,
            value: [
                { currency: 'USD', value: 173.20 },
                256,
                11
            ]
        }
    ];

    const valueIds = [65, 66, 87];

    const result = values.reduce(getFxValueRow(netWorthId, valueIds), []);

    t.deepEqual(result, [
        { 'values_id': 66, value: 56.728, currency: 'EUR' },
        { 'values_id': 66, value: 37.20, currency: 'CZK' },
        { 'values_id': 87, value: 173.20, currency: 'USD' }
    ]);
});
