/**
 * Redirect requests in the old-style format (pre-v3) to the current version
 */

const Database = require('./db');

const authMiddleware = require('./authMiddleware');

const { login } = require('./routes/user');

const { multipleUpdateRequestMiddleware } = require('./routes/data');
const cashflow = require('./routes/data/cashflow');
const analysis = require('./routes/data/analysis').routeGet;
const analysisDeep = require('./routes/data/analysis/deep').routeGet;

const income = require('./routes/data/income');
const bills = require('./routes/data/bills');
const funds = require('./routes/data/funds');
const food = require('./routes/data/food');
const general = require('./routes/data/general');
const social = require('./routes/data/social');
const holiday = require('./routes/data/holiday');

const listDataProcessor = { income, bills, funds, food, general, social, holiday };

const pie = require('./routes/data/pie');
const stocks = require('./routes/data/stocks');

const search = require('./routes/search');

function getYearMonthDateFromSplit(ymdString) {
    const ymd = ymdString.split(',').map(item => parseInt(item, 10));

    return {
        year: ymd[0],
        month: ymd[1],
        date: ymd[2]
    };
}

function replaceDateInBody(oldBody) {
    if (!('date' in oldBody)) {
        return oldBody;
    }

    try {
        const { year, month, date } = getYearMonthDateFromSplit(oldBody.date);

        return Object.assign({}, oldBody, { year, month, date });
    }
    catch (err) {
        return null;
    }
}

function getNewBodyFunds(oldBody) {
    if (!('transactions' in oldBody)) {
        return oldBody;
    }

    try {
        const transactionsRaw = JSON.parse(oldBody.transactions);

        const transactions = transactionsRaw
            .map(transaction => {
                const { year, month, date } = getYearMonthDateFromSplit(transaction.d);

                return {
                    year,
                    month,
                    date,
                    units: transaction.u,
                    cost: transaction.c
                };
            });

        return Object.assign({}, oldBody, { transactions });
    }
    catch (err) {
        return null;
    }
}

function getNewMethodBodyFromOld(oldMethod, oldBody, tasks) {
    const arg = tasks.shift();

    let method = oldMethod;
    let body = Object.assign({}, oldBody);

    if (method === 'post') {
        if (arg === 'update' || arg === 'add') {
            if (arg === 'update') {
                method = 'put';
            }

            body = replaceDateInBody(body);

            const table = tasks.shift();

            if (table === 'funds') {
                body = getNewBodyFunds(body);
            }

            return { method, body };
        }

        if (arg === 'delete') {
            method = 'delete';

            return { method, body };
        }
    }

    return { method: oldMethod, body: oldBody };
}

function getNewTaskFromOld(tasks) {
    const arg = tasks.shift();

    if (arg === 'login') {
        return ['user', 'login'];
    }

    if (arg === 'update' || arg === 'add' || arg === 'delete') {
        let pathName = tasks.shift();
        if (pathName === 'overview') {
            pathName = 'balance';
        }

        return ['data', pathName]
            .concat(tasks);
    }

    if (arg === 'pie') {
        return ['data', 'pie'].concat(tasks);
    }

    tasks.unshift(arg);

    return tasks;
}

function getNewQueryFromOld(oldQuery, tasks) {
    const arg = tasks.shift();

    if (arg === 'data' && tasks.shift() === 'funds') {
        const history = 'history' in oldQuery && oldQuery.history !== 'false'
            ? 'true'
            : 'false';

        if ('period' in oldQuery) {
            const oldPeriodMatch = oldQuery.period.match(/^([A-Za-z]+)([0-9]+)$/);
            if (oldPeriodMatch) {
                const period = oldPeriodMatch[1];
                const length = oldPeriodMatch[2];

                return Object.assign({}, oldQuery, { period, length, history });
            }
        }
    }

    return oldQuery;
}

function handleRoutesDataAnalysis(req, res, arg, path) {
    if (!req.params) {
        req.params = {};
    }

    const minPathLength = arg === 'analysis_category'
        ? 3
        : 2;

    if (path.length < minPathLength) {
        return res
            .status(400)
            .json({
                error: true,
                errorMessage: 'bad request'
            });
    }

    if (arg === 'analysis_category') {
        req.params.category = path.shift();
        req.params.period = path.shift();
        req.params.groupBy = path.shift();

        if (path.length) {
            req.params.pageIndex = path.shift();
        }

        return analysisDeep(req, res);
    }

    req.params.period = path.shift();
    req.params.groupBy = path.shift();

    if (path.length) {
        req.params.pageIndex = path.shift();
    }

    return analysis(req, res);
}

// eslint-disable-next-line max-statements
async function handleRoutesData(req, res, path) {
    try {
        await authMiddleware.authMiddleware(req, res, null);
    }
    catch (err) {
        return null;
    }

    const pathItem = path.shift();
    if (pathItem === 'multiple' && req.method === 'patch') {
        return multipleUpdateRequestMiddleware(req, res);
    }

    if (pathItem === 'overview' && req.method === 'get') {
        return cashflow.routeGet(req, res);
    }

    if (pathItem === 'balance') {
        if (req.method === 'put') {
            return cashflow.routePost(req, res);
        }

        if (req.method === 'post') {
            return cashflow.routePost(req, res);
        }
    }

    if (['analysis', 'analysis_category'].indexOf(pathItem) !== -1 &&
        req.method === 'get') {

        return handleRoutesDataAnalysis(req, res, pathItem, path);
    }

    if (pathItem in listDataProcessor) {
        const processor = listDataProcessor[pathItem];

        if (pathItem !== 'funds' && path.length > 0) {
            if (!req.params) {
                req.params = {};
            }

            req.params.page = path.shift();
        }

        if (req.method === 'get') {
            return processor.routeGet(req, res);
        }

        if (req.method === 'post') {
            return processor.routePost(req, res);
        }

        if (req.method === 'put') {
            return processor.routePut(req, res);
        }

        if (req.method === 'delete') {
            return processor.routeDelete(req, res);
        }
    }

    if (pathItem === 'pie' && req.method === 'get') {
        if (!req.params) {
            req.params = {};
        }

        req.params.category = path.shift();

        return pie.routeGet(req, res);
    }

    if (pathItem === 'stocks' && req.method === 'get') {
        return stocks.routeGet(req, res);
    }

    return res
        .status(400)
        .json({
            error: true,
            errorMessage: 'unknown request'
        });
}

function handleRoutesSearch(req, res, tasks) {
    if (!req.params) {
        req.params = {};
    }

    if (tasks.length < 3) {
        return res
            .status(400)
            .json({
                error: true,
                errorMessage: 'bad request'
            });
    }

    req.params.table = tasks.shift();
    req.params.column = tasks.shift();
    req.params.searchTerm = tasks.shift();

    if (tasks.length) {
        req.params.numResults = tasks.shift();
    }

    return search.routeGet(req, res);
}

function handleRoutes(req, res, tasks) {
    const firstTask = tasks.shift();

    if (firstTask === 'user' && tasks.shift() === 'login' && req.method === 'post') {
        return login(req, res);
    }

    if (firstTask === 'data') {
        return handleRoutesData(req, res, tasks);
    }

    if (firstTask === 'search') {
        return handleRoutesSearch(req, res, tasks);
    }

    return res
        .status(400)
        .json({
            error: true,
            errorMessage: 'unknown request'
        });
}

function processRequest(req, res, next) {
    const task = req.query.t;

    if (!task) {
        return next();
    }

    const tasks = task.split('/');

    const newTask = getNewTaskFromOld([].concat(tasks));

    const { method, body } = getNewMethodBodyFromOld(
        req.method.toLowerCase(), req.body, [].concat(tasks)
    );

    if (!method || !body) {
        return res
            .status(400)
            .json({
                error: true,
                errorMessage: 'bad request data'
            })
            .end();
    }

    const newQuery = getNewQueryFromOld(req.query, tasks);

    req.url = `/v3/${newTask.join('/')}`;
    req.method = method;
    req.body = body;
    req.query = newQuery;

    req.query.alpha = true;

    return handleRoutes(req, res, newTask);
}

async function processMultipleRequest(req, res, next) {
    try {
        await authMiddleware.authMiddleware(req, res, null);
    }
    catch (err) {
        return null;
    }

    try {
        const list = JSON.parse(req.body.list)

        req.body.list = list
            .map(item => {
                const tasks = item[0].split('/');

                const route = getNewTaskFromOld(tasks).slice(-1)[0];

                const { method, body } = getNewMethodBodyFromOld(
                    'post', item[2], tasks
                );

                if (!method || !body) {
                    return res
                        .status(400)
                        .json({
                            error: true,
                            errorMessage: 'bad request data'
                        })
                        .end();
                }

                const query = item[1];

                return { method, route, query, body };
            });

        req.method = 'patch';

        return multipleUpdateRequestMiddleware(req, res);
    }
    catch (err) {
        return next();
    }
}

async function handler(req, res, next) {
    const requestApi = req.url.indexOf('/api') !== -1;
    const requestOldApi = requestApi && req.url.indexOf('/api/v') === -1;

    if (!requestOldApi) {
        return next();
    }

    await Database.dbMiddleware(req, res, () => null);

    if (req.query.t && req.query.t === 'multiple') {
        return processMultipleRequest(req, res, next);
    }

    return processRequest(req, res, next);
}

module.exports = {
    getYearMonthDateFromSplit,
    replaceDateInBody,
    getNewBodyFunds,
    getNewMethodBodyFromOld,
    getNewTaskFromOld,
    getNewQueryFromOld,
    handleRoutesDataAnalysis,
    handleRoutesData,
    handleRoutesSearch,
    handleRoutes,
    processRequest,
    processMultipleRequest,
    handler
};

