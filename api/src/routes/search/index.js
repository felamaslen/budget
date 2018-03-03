/**
 * Search route
 */

const { Router } = require('express');
const common = require('../../common');

function validateParams(table, column, searchTerm, numResults) {
    if (numResults < 1 || numResults > 10) {
        throw new common.ErrorBadRequest('must request between 1 and 10 results');
    }

    const tableCols = {
        income: ['item'],
        bills: ['item'],
        food: ['item', 'category', 'shop'],
        general: ['item', 'category', 'shop'],
        holiday: ['item', 'holiday', 'shop'],
        social: ['item', 'society', 'shop']
    };

    if (!(table in tableCols)) {
        throw new common.ErrorBadRequest('invalid table');
    }

    if (tableCols[table].indexOf(column) === -1) {
        throw new common.ErrorBadRequest('invalid column');
    }

    if (!searchTerm.length) {
        throw new common.ErrorBadRequest('didn\'t provide a search term');
    }

    return true;
}

/**
 * @swagger
 * /data/search/{dataType}/{column}/{searchTerm}/{numResults}:
 *     get:
 *         summary: Search suggestions
 *         tags:
 *         - Search
 *         operationId: search
 *         description: |
 *             Get search suggestions for data input
 *         produces:
 *         - application/json
 *         parameters:
 *         - in: path
 *           name: dataType
 *           description: The type of data to get
 *           required: true
 *           type: string
 *         - in: path
 *           name: column
 *           description: The column of data to search
 *           required: true
 *           type: string
 *         - in: path
 *           name: searchTerm
 *           description: The term to search for
 *           required: true
 *           type: string
 *         - in: path
 *           name: numResults
 *           description: The number of results to return
 *           required: false
 *           type: number
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
 *                                 list:
 *                                     type: array
 *                                     items:
 *                                         type: string
 */
function routeGet(config, db) {
    return async (req, res) => {
        const table = req.params.table;
        const column = req.params.column;
        const searchTerm = req.params.searchTerm;
        const numResults = parseInt(req.params.numResults || 5, 10);

        try {
            validateParams(table, column, searchTerm, numResults);
        }
        catch (err) {
            if (err instanceof common.ErrorBadRequest) {
                return res.status(400)
                    .json({ errorMessage: err.message });
            }

            return res.end();
        }

        try {
            const result = await db.select(`${column} AS col`, `SUM(IF(${column} LIKE '${searchTerm}%', 1, 0)) AS matches`)
                .from(table)
                .where(column, 'like', `%${searchTerm}%`)
                .andWhere('uid', '=', req.user.uid)
                .groupBy('col')
                .orderBy('matches', 'desc')
                .orderBy('col')
                .limit(numResults);

            const data = {
                list: result.map(item => String(item.col))
            };

            return res.json({ data });
        }
        catch (err) {
            return res.status(500)
                .json({ errorMessage: err.message });
        }
    };
}

function handler(config, db) {
    const router = new Router();

    router.get('/:table/:column/:searchTerm/:numResults?', routeGet(config, db));

    return router;
}

module.exports = {
    routeGet,
    handler
};

