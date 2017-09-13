/**
 * Piechart data
 */

const config = require('../../../config')();

function getPieCols(category) {
    if (category === 'funds') {
        return [['item', 'cost', 'Total']];
    }

    if (category === 'food' || category === 'general') {
        return [
            ['shop', 'cost', 'Shop cost'],
            ['category', 'cost', 'Category cost']
        ];
    }

    if (category === 'social') {
        return [
            ['shop', 'cost', 'Shop cost'],
            ['society', 'cost', 'Society cost']
        ];
    }

    if (category === 'holiday') {
        return [
            ['shop', 'cost', 'Shop cost'],
            ['holiday', 'cost', 'Holiday cost']
        ];
    }

    return null;
}

function getPieQuery(db, user, pieCol, category) {
    const column = pieCol[0];
    const type = pieCol[1];

    const limit = config.data.pie.detail;

    if (type === 'cost') {
        return db.query(`
        SELECT ${column} AS col, SUM(cost) AS cost FROM ${category}
        WHERE uid = ? AND cost > 0
        GROUP BY col
        ORDER BY cost DESC
        LIMIT ?`, user.uid, limit);
    }

    return null;
}

function processQueryResult(result, pieCol, threshold) {
    let pieData = result.map(row => [row.col, row.cost]);

    const total = pieData.reduce((sum, item) => sum + item[1], 0);

    if (total > 0) {
        // concatenate very small slices into a slice called "other"
        const other = pieData
            .filter(item => item[1] / total < threshold)
            .reduce((sum, value) => sum + value[1], 0);

        pieData = pieData
            .filter(item => item[1] / total >= threshold);

        if (other > 0) {
            pieData.push(['Other', other]);
        }

        pieData = pieData.sort((one, two) => {
            if (one[1] > two[1]) {
                return -1;
            }
            if (one[1] < two[1]) {
                return 1;
            }

            return 0;
        });
    }

    return {
        title: pieCol[2],
        type: pieCol[1],
        data: pieData,
        total
    };
}

async function getPieData(db, user, pieCols, category) {
    const threshold = config.data.pie.tolerance / (2 * Math.PI);

    const queries = pieCols.map(pieCol => getPieQuery(db, user, pieCol, category));

    const results = await Promise.all(queries);

    if (!results) {
        return null;
    }

    return results
        .filter(result => result)
        .reduce((list, result, key) => list.concat([processQueryResult(
            result, pieCols[key], threshold
        )]), []);
}

/**
 * @swagger
 * /data/pie/{category}:
 *     get:
 *         summary: Get pie chart data
 *         tags:
 *             - Other
 *         operationId: getDataPie
 *         description: |
 *             Get summary of list items
 *         produces:
 *         - application/json
 *         parameters:
 *         - in: path
 *           name: category
 *           description: Category of data to get
 *           type: string
 *           required: true
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
 *                                     type: object
 *                                     properties:
 *                                         title:
 *                                             type: string
 *                                         type:
 *                                             type: string
 *                                             example: cost
 *                                         total:
 *                                             type: number
 *                                         data:
 *                                             type: array
 *                                             items:
 *                                                 type: array
 *                                                 example: ["Tesco", 419232]
 *                                                 description: array linking the item to its summed cost
 */
async function routeGet(req, res) {
    const category = req.params.category;

    const pieCols = getPieCols(category);

    if (!pieCols) {
        return res
            .status(400)
            .json({
                error: true,
                errorMessage: 'unknown category'
            });
    }

    const list = await getPieData(req.db, req.user, pieCols, category);

    const data = { list };

    return res.json({
        error: false,
        data
    });
}

module.exports = {
    getPieCols,
    processQueryResult,
    routeGet
};

