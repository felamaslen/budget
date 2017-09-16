/**
 * Get all list data
 */

const config = require('../../../config')();

const routeGetOverview = require('../cashflow').routeGet;
const routeGetFunds = require('../funds').routeGet;
const routeGetIncome = require('../income').routeGet;
const routeGetBills = require('../bills').routeGet;
const routeGetFood = require('../food').routeGet;
const routeGetGeneral = require('../general').routeGet;
const routeGetSocial = require('../social').routeGet;
const routeGetHoliday = require('../holiday').routeGet;

const routeGetCategory = {
    overview: routeGetOverview,
    funds: routeGetFunds,
    income: routeGetIncome,
    bills: routeGetBills,
    food: routeGetFood,
    general: routeGetGeneral,
    social: routeGetSocial,
    holiday: routeGetHoliday
};

const ResponseMultiple = require('../../../responseMultiple');

/**
 * @swagger
 * /data/all:
 *     get:
 *         summary: Get all list + cashflow data
 *         tags:
 *             - Other
 *         operationId: getAllData
 *         description: |
 *             Get all data required for app startup at once
 *         produces:
 *         - application/json
 *         responses:
 *             200:
 *                 description: successful operation
 *                 schema:
 *                     type: object
 *                     properties:
 *                         error:
 *                             type: boolean
 *                             example: false
 *                         data:
 *                             type: object
 *                             properties:
 *                                 overview:
 *                                     type: object
 *                                     description: Overview data
 *                                 funds:
 *                                     type: object
 *                                     description: Funds data
 *                                 income:
 *                                     type: object
 *                                     description: Income data
 *                                 bills:
 *                                     type: object
 *                                     description: Bills data
 *                                 food:
 *                                     type: object
 *                                     description: Food data
 *                                 general:
 *                                     type: object
 *                                     description: General data
 *                                 social:
 *                                     type: object
 *                                     description: Social data
 *                                 holiday:
 *                                     type: object
 *                                     description: Holiday data
 *
 */
async function routeGet(req, res) {
    const tables = ['overview'].concat(config.data.listCategories);

    req.db.requireForceToEnd = true;

    const categories = ['overview'].concat(config.data.listCategories);

    const responses = categories.map(() => new ResponseMultiple());

    const dataPromises = categories.map(
        (category, key) => routeGetCategory[category](req, responses[key])
    );

    await Promise.all(dataPromises);

    const data = responses.reduce((map, result, key) => {
        map[tables[key]] = result.result.data;

        return map;
    }, {});

    await req.db.end(null, true);

    return res.json({
        error: false,
        data
    });
}

module.exports = {
    routeGet
};
