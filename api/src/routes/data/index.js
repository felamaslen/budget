const Database = require('../../db');
const authMiddleware = require('../../authMiddleware');

const config = require('../../config')();

const cashflow = require('./cashflow');
const analysis = require('./analysis');
const analysisDeep = require('./analysis/deep');

const income = require('./income');
const bills = require('./bills');
const funds = require('./funds');
const food = require('./food');
const general = require('./general');
const social = require('./social');
const holiday = require('./holiday');

const listDataProcessor = { income, bills, funds, food, general, social, holiday };

const stocks = require('./stocks');

class ResponseMultiple {
    // replicate the response object so that we can return multiple
    // api endpoint responses
    constructor() {
        this.statusCode = 200;
        this.result = null;
        this.ended = false;
    }
    json(object) {
        this.result = object;

        return this;
    }
    end(string) {
        if (string) {
            this.result = string;
        }

        this.ended = true;

        return this;
    }
    status(statusCode) {
        this.statusCode = statusCode;

        return this;
    }
}

function getOverallStatusCode(results) {
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
async function multipleUpdateRequestMiddleware(req, res) {
    if (!('list' in req.body) || !validateTaskList(req.body.list)) {
        return res
            .status(400)
            .json({
                error: true,
                errorMessage: 'Must provide a list of tasks'
            });
    }

    const tasks = req.body.list;

    // prevent sub-routes from ending the database connection early
    req.db.requireForceToEnd = true;

    const promises = tasks
        .map(task => {
            const route = task.route;
            const method = task.method;
            const query = task.query;
            const body = task.body;

            const taskReq = Object.assign({}, req, { query, body });
            const taskRes = new ResponseMultiple();

            if (route === 'balance') {
                return cashflow.routePost(taskReq, taskRes);
            }

            if (route in listDataProcessor) {
                const processor = listDataProcessor[route];

                if (method === 'post') {
                    return processor.routePost(taskReq, taskRes);
                }

                if (method === 'put') {
                    return processor.routePut(taskReq, taskRes);
                }

                if (method === 'delete') {
                    return processor.routeDelete(taskReq, taskRes);
                }
            }

            return null;
        })
        .filter(item => item !== null);

    const results = await Promise.all(promises);

    const data = results.map(taskRes => taskRes.result);

    await req.db.end(null, true);

    const error = results.reduce(
        (status, taskRes) => status || taskRes.result.error, false
    );

    const statusCode = getOverallStatusCode(results);

    return res
        .status(statusCode)
        .json({
            error,
            data
        });
}

function handler(app) {
    // all of the following routes require database and authentication middleware
    app.use('/data/*', Database.dbMiddleware, authMiddleware.authMiddleware);

    app.patch('/data/multiple', multipleUpdateRequestMiddleware);

    // cash flow routes
    app.get('/data/overview', cashflow.routeGet);
    app.post('/data/balance', cashflow.routePost);
    app.put('/data/balance', cashflow.routePut);

    // analysis routes
    app.get('/data/analysis/:period/:groupBy/:pageIndex?', analysis.routeGet);
    app.get('/data/analysis/deep/:category/:period/:groupBy/:pageIndex?', analysisDeep.routeGet);

    // list data routes
    config.data.listCategories.forEach(category => {
        const pageParam = category === 'funds'
            ? ''
            : '/:page?';

        app.get(`/data/${category}${pageParam}`, listDataProcessor[category].routeGet);
        app.post(`/data/${category}`, listDataProcessor[category].routePost);
        app.put(`/data/${category}`, listDataProcessor[category].routePut);
        app.delete(`/data/${category}`, listDataProcessor[category].routeDelete);
    });

    // stocks route
    app.get('/data/stocks', stocks.routeGet);
}

module.exports = {
    getOverallStatusCode,
    multipleUpdateRequestMiddleware,
    handler
};

