const { DateTime } = require('luxon');
const joi = require('joi');
const { analysisDeepSchema } = require('../../../../schema');
const common = require('../common');

function getPeriodCostDeep(db, user, now, params) {
    const { period, groupBy, pageIndex, category } = params;

    const categoryColumn = common.getCategoryColumn(category, groupBy);

    const { startTime, endTime } = common.periodCondition(now, period, pageIndex);

    return db.select('item', `${categoryColumn} AS itemCol`, db.raw('SUM(cost) AS cost'))
        .from(category)
        .where('date', '>=', startTime.toISODate())
        .andWhere('date', '<=', endTime.toISODate())
        .andWhere('cost', '>', 0)
        .andWhere('uid', '=', user.uid)
        .groupBy('item', 'itemCol')
        .orderBy('itemCol');
}

function processDataResponse(result) {
    const resultObj = result.reduce((obj, { itemCol, item, cost }) => {
        if (itemCol in obj) {
            return { ...obj, [itemCol]: [...obj[itemCol], [item, Number(cost)]] };
        }

        return { ...obj, [itemCol]: [[item, Number(cost)]] };
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
        const { error, value } = joi.validate(req.params, analysisDeepSchema);

        if (error) {
            return res.status(400)
                .json({ errorMessage: error.message });
        }

        const results = await getPeriodCostDeep(db, req.user, DateTime.local(), value);

        const items = processDataResponse(results);

        return res.json({ data: { items } });
    };
}

module.exports = {
    getPeriodCostDeep,
    processDataResponse,
    routeGet
};

