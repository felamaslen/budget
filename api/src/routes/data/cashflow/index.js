/**
 * Overview data methods
 */

const overview = require('./overview');
const updateBalance = require('./updateBalance');

/**
 * @swagger
 * /data/overview:
 *     get:
 *         summary: Get overview budget data
 *         tags:
 *             - Overview
 *         operationId: getDataOverview
 *         description: |
 *             Get monthly cash flow data, broken down into categories
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
 *                                 endYearMonth:
 *                                     type: array
 *                                     example: [2018,9]
 *                                 currentYear:
 *                                     type: integer
 *                                     example: 2017,
 *                                 startYearMonth:
 *                                     type: array
 *                                     example: [2015,8]
 *                                 cost:
 *                                     type: object
 *                                     properties:
 *                                         balance:
 *                                             type: array
 *                                             description: Balance for the displayed months
 *                                             example: [488932, 916589, 1055601]
 *                                         old:
 *                                             type: array
 *                                             description: Balance for the months preceding the displayed data
 *                                             example: [140000, 235686]
 *                                         income:
 *                                             type: array
 *                                             example: [180000, 200000]
 *                                         funds:
 *                                             type: array
 *                                             example: [180000, 200000]
 *                                         bills:
 *                                             type: array
 *                                             example: [72500, 5800]
 *                                         food:
 *                                             type: array
 *                                             example: [154, 506, 366, 472]
 *                                         general:
 *                                             type: array
 *                                             example: [15000, 110, 9086]
 *                                         social:
 *                                             type: array
 *                                             example: [2300]
 *                                         holiday:
 *                                             type: array
 *                                             example: [70000, 16000]
 *                                 futureMonths:
 *                                     type: integer
 *                                     example: 12
 *                                 currentMonth:
 *                                     type: integer
 *                                     example: 9
 */
function routeGet(config, db) {
    return async (req, res) => {
        const data = await overview.getData(config, db, req.user);

        return res.json({ data });
    };
}

/**
 * @swagger
 * /data/balance:
 *     post:
 *         summary: Insert balance data
 *         tags:
 *             - Overview
 *         operationId: postDataBalance
 *         description: |
 *             Insert balance data for a year/month
 *         produces:
 *         - application/json
 *         consumes:
 *         - application/json
 *         parameters:
 *         - in: body
 *           name: item
 *           schema:
 *                type: object
 *                required:
 *                - year
 *                - month
 *                - balance
 *                properties:
 *                    year:
 *                        type: number
 *                    month:
 *                        type: number
 *                    balance:
 *                        type: number
 *         responses:
 *             201:
 *                 description: successful operation
 *                 schema:
 *                     $ref: "#/definitions/DataResponse"
 *
 */
function routePost(config, db) {
    return updateBalance.updateData(config, db, true);
}

/**
 * @swagger
 * /data/balance:
 *     put:
 *         summary: Update balance data
 *         tags:
 *             - Overview
 *         operationId: putDataBalance
 *         description: |
 *             Update balance data for year/month
 *         produces:
 *         - application/json
 *         consumes:
 *         - application/json
 *         parameters:
 *         - in: body
 *           name: item
 *           schema:
 *                type: object
 *                required:
 *                - year
 *                - month
 *                - balance
 *                properties:
 *                    year:
 *                        type: number
 *                    month:
 *                        type: number
 *                    balance:
 *                        type: number
 *         responses:
 *             200:
 *                 description: successful operation
 *                 schema:
 *                     $ref: "#/definitions/DataResponse"
 */
function routePut(config, db) {
    return updateBalance.updateData(config, db, false);
}

module.exports = {
    routeGet,
    routePost,
    routePut,
};
