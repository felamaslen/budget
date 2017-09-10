const common = require('./common');

async function getPeriodCostForCategory(db, user, condition, category, groupBy) {
    const categoryColumn = common.getCategoryColumn(category, groupBy);

    const result = await db.query(`
    SELECT ${categoryColumn} AS itemCol, SUM(cost) AS cost
    FROM ${category}
    WHERE ${condition} AND uid = ?
    GROUP BY itemCol
    `, user.uid);

    return result;
}

async function getPeriodCost(db, user, now, period, groupBy, pageIndex) {
    const categories = ['bills', 'food', 'general', 'holiday', 'social'];

    const queryCondition = common.periodCondition(now, period, pageIndex);

    const promises = await Promise.all(categories.map(
        category => getPeriodCostForCategory(
            db, user, queryCondition.condition, category, groupBy
        )
    ));

    const cost = promises
        .map((result, key) => {
            return [
                categories[key],
                result.map(item => [item.itemCol, item.cost])
            ];
        });

    return { cost, description: queryCondition.description };
}

/**
 * @swagger
 * /data/analysis/{period}/{groupBy}/{pageIndex}:
 *     get:
 *         summary: Get analysis data
 *         tags:
 *             - Analysis
 *         operationId: getDataAnalysis
 *         description: |
 *             Get weekly / monthly / yearly analysis data, broken down into paged categories
 *         produces:
 *         - application/json
 *         parameters:
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
 *                                 cost:
 *                                     type: array
 *                                     items:
 *                                         type: array
 *                                         example: ["bills", [6500, 12300]]
 */
async function routeGet(req, res) {
    const params = [
        req.params.period,
        req.params.groupBy,
        parseInt(req.params.pageIndex || 0, 10)
    ];

    const validationStatus = common.validateParams(...params);

    if (!validationStatus.isValid) {
        return common.handlerInvalidParams(req, res);
    }

    const result = await getPeriodCost(req.db, req.user, new Date(), ...params);

    return common.handlerValidResult(req, res, result);
}

module.exports = {
    getPeriodCostForCategory,
    getPeriodCost,
    routeGet
};

