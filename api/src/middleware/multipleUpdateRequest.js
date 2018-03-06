/**
 * Multiple update request middleware
 */

const cashflow = require('../routes/data/cashflow');
const ResponseMultiple = require('../responseMultiple');

function validateTaskList(list) {
    if (!Array.isArray(list)) {
        return false;
    }

    return list.reduce((status, task) => {
        if (!status) {
            return false;
        }

        return 'route' in task && typeof task.route === 'string' &&
            'method' in task && typeof task.method === 'string' &&
            'query' in task && typeof task.query === 'object' &&
            'body' in task && typeof task.body === 'object';
    }, true);
}

function getOverallStatusCode(results) {
    if (!results.length) {
        return 200;
    }

    const statusCode = results.reduce((status, taskRes) => {
        // use the following status codes, in order of precedence
        if (taskRes.statusCode >= 500) {
            // server error
            if (status >= 500 && status !== taskRes.statusCode) {
                return 500;
            }

            return taskRes.statusCode;
        }
        if (status < 500 && taskRes.statusCode >= 400) {
            // client error
            if (status >= 400 && status !== taskRes.statusCode) {
                return 400;
            }

            return taskRes.statusCode;
        }
        if (status < 400 && taskRes.statusCode < 300 && taskRes.statusCode >= 200) {
            // success code
            if (status >= 200 && status !== taskRes.statusCode) {
                return 200;
            }

            return taskRes.statusCode;
        }

        return status;
    }, 0);

    if (!statusCode) {
        return 500;
    }

    return statusCode;
}

/**
 * @swagger
 * /multiple:
 *     patch:
 *         summary: Run multiple operations
 *         tags:
 *             - Other
 *         operationId: multipleUpdateRequests
 *         description: |
 *             Run multiple update requests in parallel
 *         produces:
 *         - application/json
 *         consumes:
 *         - application/json
 *         parameters:
 *         - in: body
 *           name: taskList
 *           schema:
 *               type: object
 *               required:
 *               - tasks
 *               properties:
 *                   tasks:
 *                       type: array
 *                       items:
 *                           type: object
 *                           properties:
 *                               route:
 *                                   type: string
 *                                   description: sub-path of api/data to activate
 *                               method:
 *                                   type: string
 *                                   description: method of request route
 *                               query:
 *                                   type: object
 *                                   description: what would be in the URL query
 *                               body:
 *                                   type: object
 *                                   description: what would be in the form body
 *           responses:
 *               200:
 *                   description: successful operation
 *                   schema:
 *                       type: array
 *                       items:
 *                           schema:
 *                               $ref: "#/definitions/DataResponsePostList"
 */
function routePatch(config, db, listDataProcessor) {
    return async (req, res) => {
        if (!('list' in req.body) && validateTaskList(req.body.list)) {
            return res.status(400)
                .json({
                    errorMessage: 'Must provide a list of tasks'
                });
        }

        const tasks = req.body.list;

        const promises = tasks
            .map(({ route, method, query, body }) => {
                const taskReq = { ...req, query, body };
                const taskRes = new ResponseMultiple();

                if (route === 'balance') {
                    return cashflow.routePost(config, db)(taskReq, taskRes);
                }

                if (route in listDataProcessor) {
                    const processor = listDataProcessor[route];

                    if (method === 'post') {
                        return processor.routePost(config, db)(taskReq, taskRes);
                    }

                    if (method === 'put') {
                        return processor.routePut(config, db)(taskReq, taskRes);
                    }

                    if (method === 'delete') {
                        return processor.routeDelete(config, db)(taskReq, taskRes);
                    }
                }

                return null;
            })
            .filter(item => item !== null);

        try {
            const allResults = await Promise.all(promises);

            const data = allResults.map(({ result }) => result);

            const error = allResults.reduce((status, { result }) => status || result.error, false);

            const statusCode = getOverallStatusCode(allResults);

            return res
                .status(statusCode)
                .json({ error, data });
        }
        catch (err) {
            return res.status(400)
                .json({ errorMessage: err.message });
        }
    };
}

module.exports = {
    routePatch,
    getOverallStatusCode
};

