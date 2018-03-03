const common = require('../common');

function getPeriodCostDeep(db, user, now, period, groupBy, pageIndex = 0, category) {
    const categoryColumn = common.getCategoryColumn(category, groupBy);

    const { condition } = common.periodCondition(now, period, pageIndex);

    return db.select('item', `${categoryColumn} AS itemCol`, 'SUM(cost) AS cost')
        .from(category)
        .whereRaw(condition)
        .andWhere('cost', '>', 0)
        .andWhere('uid', '=', user.uid)
        .groupBy('item', 'itemCol')
        .orderBy('itemCol');
}

function processDataResponse(result) {
    const resultObj = result.reduce((obj, { itemCol, item, cost }) => {
        if (itemCol in obj) {
            return { ...obj, [itemCol]: [...obj[itemCol], [item, cost]] };
        }

        return { ...obj, [itemCol]: [[item, cost]] };
    }, {});

    return Object.keys(resultObj).map(itemCol => ([itemCol, resultObj[itemCol]]));
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
function routeGet(config, db) {
    return async (req, res) => {
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

        const items = await getPeriodCostDeep(db, req.user, new Date(), ...params);

        const result = { items: processDataResponse(items) };

        return common.handlerValidResult(req, res, result);
    };
}

module.exports = {
    getPeriodCostDeep,
    processDataResponse,
    routeGet
};

