const common = require('../common');

async function getPeriodCostDeep(db, user, now, period, groupBy, pageIndex = 0, category) {
    const categoryColumn = common.getCategoryColumn(category, groupBy);

    const queryCondition = common.periodCondition(now, period, pageIndex);

    const result = await db.query(`
    SELECT item, ${categoryColumn} AS itemCol, SUM(cost) AS cost
    FROM ${category}
    WHERE ${queryCondition.condition} AND uid = ? AND cost > 0
    GROUP BY item, itemCol
    ORDER BY itemCol
    `, user.uid);

    return result;
}

function processDataResponse(result) {
    const resultObj = result
        .reduce((obj, item) => {
            if (item.itemCol in obj) {
                obj[item.itemCol].push([item.item, item.cost]);
            }
            else {
                obj[item.itemCol] = [[item.item, item.cost]];
            }

            return obj;
        }, {});

    return Object.keys(resultObj)
        .map(itemCol => {
            return [itemCol, resultObj[itemCol]];
        });
}

/**
 * @swagger
 * /data/analysis/deep/{category}/{period}/{groupBy}/{pageIndex}:
 *     get:
 *         summary: Get deep analysis data
 *         tags:
 *             - Analysis
 *         operationId: getDataAnalysisDeep
 *         description: |
 *             Get weekly / monthly / yearly analysis data, broken down by category into paged items
 *         produces:
 *         - application/json
 *         parameters:
 *         - in: path
 *           name: category
 *           description: category of data to retrieve
 *           required: true
 *           type: string
 *         - in: path
 *           name: period
 *           description: one of week, month, year
 *           required: true
 *           type: string
 *         - in: path
 *           name: groupBy
 *           description: one of category, shop
 *           required: true
 *           type: string
 *         - in: path
 *           name: pageIndex
 *           description: page to retrieve, starting with 0
 *           type: integer
 *         responses:
 *             200:
 *                 description: successful operation
 *                 schema:
 *                     type: object
 *                     properties:
 *                         data:
 *                             type: object
 *                             properties:
 *                                 items:
 *                                     type: array
 *                                     example: ["bills", [["Electricity", 6500], ["Water", 12300]]]
 *
 */
async function routeGet(req, res) {
    const params = [
        req.params.period,
        req.params.groupBy,
        parseInt(req.params.pageIndex || 0, 10),
        req.params.category
    ];

    const validationStatus = common.validateParams(...params);

    if (!validationStatus.isValid) {
        return common.handlerInvalidParams(req, res);
    }

    const items = await getPeriodCostDeep(req.db, req.user, new Date(), ...params);

    const result = { items: processDataResponse(items) };

    return common.handlerValidResult(req, res, result);
}

module.exports = {
    getPeriodCostDeep,
    processDataResponse,
    routeGet
};

