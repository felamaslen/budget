/**
 * Funds routes
 */

const config = require('../../../config')();
const funds = require('./common');
const listCommon = require('../list.common');

function postProcessListRow(row, getPriceHistory, priceHistory = null) {
    // transactions
    row.tr = row.t
        ? JSON.parse(row.t)
        : [];

    Reflect.deleteProperty(row, 't');

    if (getPriceHistory) {
        row.pr = priceHistory.idMap[row.I] || [];

        row.prStartIndex = priceHistory.startIndex[row.I] || 0;
    }

    return row;
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
 *                                             c:
 *                                                 type: integer
 *                                                 example: 50000
 *                                                 description: To-date cost of this holding
 *                                             d:
 *                                                 type: array
 *                                                 example: [2017, 4, 1]
 *                                                 description: Date of first purchase
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
async function routeGet(req, res) {
    const now = new Date();

    const columnMap = {
        item: 'i',
        transactions: 't',
        cost: 'c'
    };

    let addData = row => postProcessListRow(row);

    const getPriceHistory = 'history' in req.query &&
        req.query.history !== 'false';
    let priceHistory = null;

    if (getPriceHistory) {
        let period = null;
        let length = null;
        if (['year', 'month'].indexOf(req.query.period) > -1 &&
            !isNaN(parseInt(req.query.length, 10))) {

            period = req.query.period;
            length = parseInt(req.query.length, 10);
        }

        priceHistory = await funds.getFundHistoryMappedToFundIds(
            req.db,
            req.user,
            now,
            period,
            length,
            config.data.funds.historyResolution,
            config.data.funds.salt
        );

        addData = row => {
            return postProcessListRow(row, getPriceHistory, priceHistory);
        }
    }

    const data = await listCommon.getResults(
        req.db, req.user, now, 'funds', columnMap, addData
    );

    if (getPriceHistory) {
        data.startTime = priceHistory.startTime;
        data.cacheTimes = priceHistory.times;
    }

    await req.db.end();

    return res.json({
        error: false,
        data
    });
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
 *           name: year
 *           required: true
 *           type: number
 *         - in: body
 *           name: month
 *           required: true
 *           type: number
 *         - in: body
 *           name: date
 *           required: true
 *           type: number
 *         - in: body
 *           name: item
 *           required: true
 *           type: string
 *         - in: body
 *           name: transactions
 *           required: true
 *           type: array
 *         - in: body
 *           name: cost
 *           required: true
 *           type: integer
 *         responses:
 *             201:
 *                 description: successful operation
 *                 schema:
 *                     $ref: "#/definitions/DataResponsePostList"
 */
function routePost(req, res) {
    return listCommon.routePost(req, res, 'funds', funds.validateInsertData);
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
 *           name: year
 *           required: true
 *           type: number
 *         - in: body
 *           name: month
 *           required: true
 *           type: number
 *         - in: body
 *           name: date
 *           required: true
 *           type: number
 *         - in: body
 *           name: item
 *           required: false
 *           type: string
 *         - in: body
 *           name: transactions
 *           required: false
 *           type: array
 *         - in: body
 *           name: cost
 *           required: false
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
function routePut(req, res) {
    return listCommon.routePut(req, res, 'funds', funds.validateUpdateData);
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
function routeDelete(req, res) {
    return listCommon.routeDelete(req, res, 'funds');
}

module.exports = {
    routeGet,
    routePost,
    routePut,
    routeDelete
};
