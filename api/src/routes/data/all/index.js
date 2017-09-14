/**
 * Get all list data
 */

const config = require('../../../config')();
const overview = require('../cashflow/overview');
const listCommon = require('../list.common');

function getListData(db, user, now, table) {
    const limit = listCommon.getPageLimit(table);

    return listCommon.getResults(db, user, now, table, null, limit);
}

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

    const now = new Date();

    const dataPromises = [overview.getData(req.db, req.user)]
        .concat(config.data.listCategories.map(
            category => getListData(req.db, req.user, now, category)
        ));

    const results = await Promise.all(dataPromises);

    const data = results.reduce((map, result, key) => {
        map[tables[key]] = result;

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

