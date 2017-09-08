/**
 * Redirect requests in the old-style format (pre-v3) to the current version
 */

function getYearMonthDateFromSplit(ymdString) {
    const ymd = ymdString.split(',').map(item => parseInt(item, 10));

    return {
        year: ymd[0],
        month: ymd[1],
        date: ymd[2]
    };
}

function replaceDateInBody(oldBody) {
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

function getNewMethodBodyFromOld(oldMethod, oldBody, task) {
    const tasks = task.split('/');
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

function getNewTaskFromOld(task) {
    const tasks = task.split('/');
    const arg = tasks.shift();

    if (arg === 'login') {
        return 'user/login';
    }

    if (arg === 'update' || arg === 'add' || arg === 'delete') {
        return `data/${tasks.join(',')}`;
    }

    return task;
}

function getNewQueryFromOld(oldQuery, task) {
    const tasks = task.split('/');
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

function handler(req, res, next) {
    if (req.baseUrl.indexOf('/api') === -1) {
        return next();
    }

    const task = req.query.t;
    if (!task) {
        return next();
    }

    const newTask = getNewTaskFromOld(task);

    const { method, body } = getNewMethodBodyFromOld(
        req.method.toLowerCase(), req.body, task
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

    const newQuery = getNewQueryFromOld(req.query, task);

    req.url = `/v3/${newTask}`;
    req.method = method;
    req.body = body;
    req.query = newQuery;

    req.query.alpha = true;

    return next();
}

module.exports = {
    getNewTaskFromOld,
    getNewMethodBodyFromOld,
    handler
};

