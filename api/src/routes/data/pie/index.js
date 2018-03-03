/**
 * Piechart data
 */

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

function getPieQuery(config, db, user, pieCol, category) {
    const [column, type] = pieCol;

    const limit = config.data.pie.detail;

    if (type === 'cost') {
        return db.select(`${column} AS col`, 'SUM(cost) AS cost')
            .from(category)
            .where('cost', '>', 0)
            .andWhere('uid', '=', user.uid)
            .groupBy('col')
            .orderby('cost', 'desc')
            .limit(limit);
    }

    return null;
}

function processQueryResult(result, pieCol, threshold) {
    const [, type, title] = pieCol;

    let data = result.map(row => ([row.col, row.cost]));

    const total = data.reduce((sum, [, cost]) => sum + cost, 0);

    if (total > 0) {
        // concatenate very small slices into a slice called "other"
        const other = data
            .filter(([, cost]) => cost < threshold * total)
            .reduce((sum, [, cost]) => sum + cost, 0);

        const display = data.filter(([, cost]) => cost >= threshold * total);

        const all = other > 0
            ? [...display, ['Other', other]]
            : display;

        data = all.sort(([, cost1], [, cost2]) => {
            if (cost1 > cost2) {
                return -1;
            }
            if (cost1 < cost2) {
                return 1;
            }

            return 0;
        });
    }

    return { title, type, data, total };
}

async function getPieData(config, db, user, pieCols, category) {
    const threshold = config.data.pie.tolerance / (2 * Math.PI);

    const results = await Promise.all(pieCols.map(pieCol =>
        getPieQuery(config, db, user, pieCol, category)));

    if (!results) {
        return null;
    }

    return results
        .filter(result => result)
        .map((result, key) => processQueryResult(result, pieCols[key], threshold));
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
function routeGet(config, db) {
    return async (req, res) => {
        const category = req.params.category;

        const pieCols = getPieCols(category);

        if (!pieCols) {
            return res.status(400)
                .json({
                    errorMessage: 'unknown category'
                });
        }

        const list = await getPieData(config, db, req.user, pieCols, category);

        const data = { list };

        return res.json({ data });
    };
}

module.exports = {
    getPieCols,
    processQueryResult,
    routeGet
};

