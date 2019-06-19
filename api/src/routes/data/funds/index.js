/**
 * Funds routes
 */

const { DateTime } = require('luxon');
const common = require('./common');
const listCommon = require('../list.common');
const schema = require('../../../schema/funds');

function formatResults(columnMap, getPriceHistory, priceHistory = null) {
    const commonProps = listCommon.formatResults(columnMap);

    if (getPriceHistory) {
        const addPrices = row => ({
            ...row,
            pr: priceHistory.idMap[row.I] || [],
            prStartIndex: priceHistory.startIndex[row.I] || 0
        });

        return row => addPrices(commonProps(row));
    }

    return row => commonProps(row);
}

async function getQuery(db, user) {
    const rows = await db.select(
        'funds.id',
        'funds.item',
        'transactions.date',
        'transactions.units',
        'transactions.cost'
    )
        .from('funds')
        .leftJoin('funds_transactions as transactions', 'transactions.fund_id', 'funds.id')
        .where('funds.uid', '=', user.uid);

    const { items: funds } = rows.reduce(({ items, fundIds }, { id, item, date, units, cost }) => {
        const transaction = date
            ? { date, units, cost }
            : null;

        const idIndex = fundIds.indexOf(id);
        if (idIndex > -1) {
            items[idIndex].transactions.push(transaction);

            return { items, fundIds };
        }

        const transactions = transaction
            ? [transaction]
            : [];

        return {
            items: [
                ...items,
                { id, item, transactions }
            ],
            fundIds: [...fundIds, id]
        };

    }, { items: [], fundIds: [] });

    return funds;
}

/**
 * @swagger
 * /data/funds:
 *     get:
 *         summary: Get funds data
 *         tags:
 *             - Funds
 *         operationId: getDataFunds
 *         description: |
 *             Get a list of fund holdings, optionally with price history
 *         produces:
 *         - application/json
 *         parameters:
 *         - in: query
 *           name: history
 *           description: whether or not to retrieve price history with holdings data
 *           required: false
 *           type: boolean
 *         - in: query
 *           name: period
 *           description: period of time to retrieve price history over
 *           required: false
 *           type: string
 *           example: year
 *         - in: query
 *           name: length
 *           description: number of periods to retrive price history for
 *           required: false
 *           type: integer
 *           example: 3
 *         responses:
 *             200:
 *                 description: successful operation
 *                 schema:
 *                     type: object
 *                     properties:
 *                         data:
 *                             type: object
 *                             properties:
 *                                 total:
 *                                     type: integer
 *                                     example: 1000000
 *                                     description: Total-to-date purchase cost of all holdings
 *                                 data:
 *                                     type: array
 *                                     items:
 *                                         type: object
 *                                         properties:
 *                                             I:
 *                                                 type: integer
 *                                                 example: 11
 *                                                 description: ID of holding
 *                                             i:
 *                                                 type: string
 *                                                 example: Gold ETF
 *                                                 description: Name of holding
 *                                             tr:
 *                                                 type: array
 *                                                 description: List of transactions for this holding
 *                                                 items:
 *                                                     type: array
 *                                                     items:
 *                                                         type: object
 *                                                         properties:
 *                                                             c:
 *                                                                 type: integer
 *                                                                 description: Cost of transaction
 *                                                                 example: 200000
 *                                                             u:
 *                                                                 type: float
 *                                                                 description: Units purchased (or sold)
 *                                                                 example: 1499.7
 *                                                             d:
 *                                                                 type: array
 *                                                                 description: Date of transaction
 *                                                                 example: [2016, 9, 21]
 *                                             pr:
 *                                                 type: array
 *                                                 example: [103.4, 102.97, 103.94]
 *                                                 description: List of cached asset prices
 *                                             prStartIndex:
 *                                                 type: integer
 *                                                 example: 1
 *                                                 description: Where in the list of price-cache times this holding first appears
 *                                 startTime:
 *                                     type: integer
 *                                     description: Timestamp of the first price cache time
 *                                     example: 1475661661
 *                                 cacheTimes:
 *                                     type: array
 *                                     description: Timestamps of all of the price cache times, relative to startTime
 *                                     example: [0, 259200, 518400]
 */
function routeGet(config, db) {
    return async (req, res) => {
        const now = DateTime.local();
        const columnMap = {
            id: 'I',
            date: 'd',
            item: 'i',
            transactions: 'tr'
        };

        const queryResult = await getQuery(db, req.user);

        let priceHistory = null;
        const getPriceHistory = 'history' in req.query && req.query.history !== 'false';
        if (getPriceHistory) {
            let period = null;
            let length = null;

            const hasPeriod = ['year', 'month'].includes(req.query.period) &&
                !isNaN(Number(req.query.length));

            if (hasPeriod) {
                period = req.query.period;
                length = Number(req.query.length);
            }

            const params = {
                period,
                length,
                numDisplay: config.data.funds.historyResolution,
                salt: config.data.funds.salt
            };

            priceHistory = await common.getFundHistoryMappedToFundIds(db, req.user, now, params);
        }

        const listData = queryResult.map(formatResults(columnMap, getPriceHistory, priceHistory));

        const total = await listCommon.getTotalCost(db, req.user, 'funds');

        const data = { data: listData, total };

        if (getPriceHistory) {
            const { startTime, times: cacheTimes } = priceHistory;

            return res.json({ data: { ...data, startTime, cacheTimes } });
        }

        return res.json({ data });
    };
}

function insertTransactions(db, user, id, transactions) {
    return db.transaction(trx => transactions.reduce(
        (last, { date, units, cost }) => last.then(() => trx
            .insert({ 'fund_id': id, date, units, cost })
            .into('funds_transactions')
        ),
        Promise.resolve()
    ));
}

async function insertFund(db, user, table, data) {
    const { item, transactions } = data;

    const { id } = await listCommon.insertItem(db, user, 'funds', { item });

    await insertTransactions(db, user, id, transactions);

    return { id };
}

async function updateFund(db, user, table, data) {
    const { id, item, transactions } = data;

    await listCommon.updateItem(db, user, 'funds', { id, item });

    if (transactions) {
        await db('funds_transactions').where('fund_id', '=', id)
            .del();

        await insertTransactions(db, user, id, transactions);
    }
}

/**
 * @swagger
 * /data/funds:
 *     post:
 *         summary: Insert funds data
 *         tags:
 *             - Funds
 *         operationId: postDataFunds
 *         description: |
 *             Insert a new fund holding into the database
 *         produces:
 *         - application/json
 *         parameters:
 *         - in: body
 *           name: item
 *           required: true
 *           type: string
 *         - in: body
 *           name: transactions
 *           required: true
 *           type: array
 *         responses:
 *             201:
 *                 description: successful operation
 *                 schema:
 *                     $ref: "#/definitions/DataResponsePostList"
 */
function routePost(config, db) {
    return listCommon.routeModify(config, db, 'funds', schema.insert, insertFund, 201);
}

/**
 * @swagger
 * /data/funds:
 *     put:
 *         summary: Update funds data
 *         tags:
 *             - Funds
 *         operationId: putDataFunds
 *         description: |
 *             Update an existing fund holding in the database
 *         produces:
 *         - application/json
 *         parameters:
 *         - in: body
 *           name: id
 *           required: true
 *           type: integer
 *         - in: body
 *           name: item
 *           required: false
 *           type: string
 *         - in: body
 *           name: transactions
 *           required: false
 *           type: array
 *         responses:
 *             200:
 *                 description: successful operation
 *                 schema:
 *                     $ref: "#/definitions/DataResponsePutList"
 *             400:
 *                 description: invalid id
 *                 schema:
 *                     $ref: "#/definitions/ErrorResponse"
 */
function routePut(config, db) {
    return listCommon.routeModify(config, db, 'funds', schema.update, updateFund);
}

/**
 * @swagger
 * /data/funds:
 *     delete:
 *         summary: Delete funds data
 *         tags:
 *             - Funds
 *         operationId: deleteDataFunds
 *         description: |
 *             Delete an existing fund holding in the database
 *         produces:
 *         - application/json
 *         parameters:
 *         - in: body
 *           name: id
 *           required: true
 *           type: integer
 *         responses:
 *             200:
 *                 description: successful operation
 *                 schema:
 *                     $ref: "#/definitions/DataResponsePutList"
 *             400:
 *                 description: invalid id
 *                 schema:
 *                     $ref: "#/definitions/ErrorResponse"
 */
function routeDelete(config, db) {
    return listCommon.routeDelete(config, db, 'funds');
}

module.exports = {
    routeGet,
    routePost,
    routePut,
    routeDelete
};

