/**
 * Retrieve stocks data for the stocks ticker
 */

function getStocks(db, user) {
    return db.select('code', 'name', db.raw('SUM(weight * subweight)::float AS sum_weight'))
        .from('stocks')
        .where('uid', '=', user.uid)
        .groupBy('code', 'name')
        .orderBy('sum_weight', 'desc');
}

function processStocks(queryResult, apiKey) {
    const stocks = queryResult.map(({ code, name, sum_weight: sumWeight }) => ([
        code, name, sumWeight,
    ]));

    const total = stocks.reduce((sum, [, , weight]) => sum + weight, 0);

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
function routeGet(config, db) {
    return async (req, res) => {
        const stocksQueryResult = await getStocks(db, req.user);

        const data = processStocks(stocksQueryResult, config.data.funds.stocksApiKey);

        return res.json({ data });
    };
}

module.exports = {
    getStocks,
    processStocks,
    routeGet,
};
