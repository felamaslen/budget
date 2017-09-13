/**
 * Retrieve stocks data for the stocks ticker
 */

const config = require('../../../config')();

function getStocks(db, user) {
    return db.query(`
    SELECT code, name, SUM(weight * subweight) AS sumWeight
    FROM stocks
    WHERE uid = ?
    GROUP BY code, name
    ORDER BY sumWeight DESC
    `, user.uid);
}

function processStocks(queryResult, apiKey) {
    const stocks = queryResult.map(row => {
        const weight = parseInt(row.sumWeight, 10);

        return [row.code, row.name, weight];
    });

    const total = stocks.reduce((sum, item) => sum + item[2], 0);

    return { stocks, total, apiKey };
}

/**
 * @swagger
 * /data/stocks:
 *     get:
 *         summary: Get stocks data
 *         tags:
 *             - Funds
 *         operationId: getDataStocks
 *         description: |
 *             Get a weighted list of stocks holdings
 *         produces:
 *         - application/json
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
 *                                     description: total weight
 *                                 apiKey:
 *                                     type: string
 *                                     description: api key for stock quotes
 *                                 stocks:
 *                                     type: array
 *                                     items:
 *                                         type: array
 *                                         example: ["NASDAQ:GOOGL", "Alphabet Inc Class A", 11239]
 */
async function routeGet(req, res) {
    const stocksQueryResult = await getStocks(req.db, req.user);

    const data = processStocks(stocksQueryResult, config.data.funds.stocksApiKey);

    await req.db.end();

    return res.json({
        error: false,
        data
    });
}

module.exports = {
    getStocks,
    processStocks,
    routeGet
}

