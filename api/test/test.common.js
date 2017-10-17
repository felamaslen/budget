/**
 * Common stuff for testing
 */

/* eslint max-lines: 0 */

const mysql = require('mysql');

const config = require('../src/config')();

class Req {
    constructor(options = {}) {
        this.headers = options.headers || {};
        this.path = options.path;
        this.method = options.method || 'get';
        this.params = options.params || {};
        this.form = options.form || {};
        this.query = options.query || {};
    }
}
class Res {
    constructor() {
        this.response = null;
        this.statusCode = 200;
        this.ended = false;
    }
    status(code) {
        this.statusCode = code;

        return this;
    }
    json(object) {
        this.response = JSON.parse(JSON.stringify(object));

        return this;
    }
    end(string = null) {
        if (string) {
            this.response = string.toString();
        }
        this.ended = true;

        return this;
    }
}

class DummyExpress {
    constructor() {
        this.routes = [];
    }
    filterRoutes(path, method) {
        let maxScore = -1;
        const routes = this.routes
            .filter(route => {
                return route.method === 'middleware' || route.method === method;
            })
            .map(route => {
                if (!route.path) {
                    return { route };
                }

                const pathArgs = path.split('/');
                const routeArgs = route.path.split('/');

                const params = [];

                const pathScore = routeArgs.reduce((sum, arg) => {
                    if (!pathArgs.length) {
                        // exhausted path; invalid route
                        return null;
                    }

                    if (arg.match(/^:\w+$/)) {
                        // arg is a parameter
                        params.push(pathArgs.shift());

                        return sum + 1;
                    }

                    if (arg === pathArgs.shift()) {
                        return sum + 1;
                    }

                    return null;
                }, 0);

                if (pathScore === null) {
                    return null;
                }

                maxScore = Math.max(maxScore, pathScore);

                return { route, pathScore };
            })
            .filter(item => item !== null)
            .filter(item => {
                return !('pathScore' in item) || item.pathScore === maxScore;
            })
            .map(item => item.route);

        return routes;
    }
    test(options) {
        const method = options.method || 'get';

        const routes = this.filterRoutes(options.path, method);

        const req = new Req(options);
        const res = new Res();

        return routes.reduce((last, route) => {
            if (last.ended) {
                return last;
            }

            route.callback(req, res);

            return res;
        }, res);
    }
    use(pathParam, ...callbacks) {
        let path = null;
        if (typeof pathParam === 'function') {
            callbacks.unshift(pathParam);
        }
        else {
            path = pathParam;
        }

        const method = 'middleware';

        callbacks.forEach(callback => {
            this.routes.push({ method, path, callback });
        });
    }
    addRoute(method, path, callback) {
        this.routes.push({ method, path, callback });
    }
    get(path, callback) {
        this.addRoute('get', path, callback);
    }
    post(path, callback) {
        this.addRoute('post', path, callback);
    }
    put(path, callback) {
        this.addRoute('put', path, callback);
    }
    delete(path, callback) {
        this.addRoute('delete', path, callback);
    }
    patch(path, callback) {
        this.addRoute('patch', path, callback);
    }
}

class DummyDb {
    constructor() {
        this.queries = [];
        this.ended = false;
    }
    query(sql, ...args) {
        const rawQuery = sql
            .replace(/\?/g, () => mysql.escape(args.shift()))
            .replace(/\s+/g, ' ')
            .replace(/^\s+/, '')
            .replace(/\s+$/, '');

        this.queries.push(rawQuery);

        return rawQuery;
    }
    end() {
        this.ended = true;
    }
}

class DummyDbWithUser extends DummyDb {
    constructor() {
        super();

        this.ipLog = [];
    }
    handleLogin(match) {
        const testGoodApiKey = 'test_good_api_key';

        if (match[3] === testGoodApiKey) {
            return [{
                uid: 1,
                name: 'johnsmith',
                apiKey: testGoodApiKey
            }];
        }

        return [];
    }
    handleGetIpLog(match) {
        const ip = match[1];

        return this.ipLog
            .filter(item => item.ip === ip);
    }
    handleRemoveIpLog(match, query) {
        const ip = match[1];

        this.ipLog = this.ipLog.filter(item => item.ip !== ip);

        return query;
    }
    handleUpdateIpLog(match, query) {
        const ip = match[1];
        const time = parseInt(match[2], 10);
        const count = parseInt(match[3], 10);

        const index = this.ipLog.findIndex(item => item.ip === ip);
        if (index === -1) {
            this.ipLog.push({ ip, time, count });
        }
        else {
            this.ipLog[index].time = time;
            this.ipLog[index].count = count;
        }

        return query;
    }
    query(sql, ...args) {
        const rawQuery = super.query(sql, ...args);

        const getUserQueryMatch = rawQuery.match(
            /^SELECT uid, user( AS name)?(, api_key)? FROM users WHERE api_key = '(\w+)' LIMIT 1$/
        );

        const getIpLogMatch = rawQuery.match(
            /^SELECT time, count FROM ip_login_req WHERE ip = '([0-9.]+)' LIMIT 1$/
        );

        const removeIpLogMatch = rawQuery.match(
            /^DELETE FROM ip_login_req WHERE ip = '([0-9.]+)'$/
        );

        const updateIpLogMatch = rawQuery.match(new RegExp(
            '^INSERT INTO ip_login_req \\(ip, time, count\\) ' +
            'VALUES\\(\'([0-9.]+)\', ([0-9]+), ([0-9]+)\\) ' +
            'ON DUPLICATE KEY UPDATE time = \\2, count = \\3'
        ));

        // console.log({ rawQuery, getUserQueryMatch, removeIpLogMatch, getIpLogMatch, updateIpLogMatch });

        if (getUserQueryMatch) {
            return this.handleLogin(getUserQueryMatch);
        }

        if (getIpLogMatch) {
            return this.handleGetIpLog(getIpLogMatch);
        }

        if (removeIpLogMatch) {
            return this.handleRemoveIpLog(removeIpLogMatch, rawQuery);
        }

        if (updateIpLogMatch) {
            return this.handleUpdateIpLog(updateIpLogMatch, rawQuery);
        }

        return rawQuery;
    }
}

const testPricesQueryResponse = [
    { time: 1504285261, id: '11,1,3', price: '100,123,50.97' },
    { time: 1504198862, id: '1,11,3', price: '121,99.13,56.01' },
    { time: 1504112461, id: '11,1,3', price: '124.04,95.49,49.52' },
    { time: 1478500000, id: '11', price: '95.3' }
];

const testTransactionsQueryResponse = [
    { id: 3, transactions: '[{"c":200000,"u":1678.42,"d":[2016,9,19]},{"c":100000,"u":846.38,"d":[2017,2,14]}]' },
    { id: 11, transactions: '[{"c":10000,"u":89.095,"d":[2016,8,24]},{"c":100000,"u":894.134,"d":[2016,9,19]},{"c":-90000,"u":-883.229,"d":[2017,4,27]}]' }
];

class DummyDbWithFunds extends DummyDb {
    query(sql, ...args) {
        const rawQuery = super.query(sql, ...args);

        const getFundPricesMatch = rawQuery.match(new RegExp(
            '^SELECT ft.time, GROUP_CONCAT\\(f.id\\) AS id, GROUP_CONCAT\\(fc.price\\) AS price ' +
            'FROM fund_cache fc ' +
            'INNER JOIN fund_hash fh ON fh.fid = fc.fid ' +
            'INNER JOIN fund_cache_time ft ON ft.cid = fc.cid AND ft.done = 1 ' +
            `INNER JOIN funds f ON MD5\\(CONCAT\\(f.item, '${config.data.funds.salt}'\\)\\) = fh.hash ` +
            'AND f.uid = 1 GROUP BY ft.cid ORDER BY ft.time DESC$'
        ));

        const getFundTransactionsMatch = rawQuery.match(/^SELECT id, transactions FROM funds WHERE uid = 1$/);

        if (getFundPricesMatch) {
            // test fund price data
            return testPricesQueryResponse;
        }

        if (getFundTransactionsMatch) {
            // test fund transactions data
            return testTransactionsQueryResponse;
        }

        return rawQuery;
    }
}

class DummyDbWithListOverview extends DummyDb {
    getData() {
        return [1068, 7150, 9173].map(monthCost => {
            return { monthCost };
        });
    }
    async query(sql, ...args) {
        const rawQuery = super.query(sql, ...args);

        const listOverviewMatch = rawQuery.match(new RegExp(String(
            '^SELECT SUM\\(cost\\) AS monthCost FROM \\(' +
            'SELECT [0-9]+ AS year, [0-9]+ AS month' +
            '( UNION SELECT [0-9]+, [0-9]+)*' +
            '\\) AS dates ' +
            'LEFT JOIN `\\w+` AS list ON uid = [0-9]+ ' +
            'AND list.year = dates.year AND list.month = dates.month ' +
            'GROUP BY dates.year, dates.month'
        )));

        if (listOverviewMatch) {
            const data = await this.getData();

            return data;
        }

        return rawQuery;
    }
}

class DummyDbWithListOverviewDelay extends DummyDbWithListOverview {
    getData() {
        const result = super.getData();

        return new Promise(resolve => {
            setTimeout(() => resolve(result), 15);
        });
    }
}

class DummyDbWithAnalysis extends DummyDb {
    constructor() {
        super();

        const testData = {
            item: [['a', 999], ['b', 1923], ['c', 110], ['d', 91], ['e', 110]],
            category: [['f', 10], ['g', 103]],
            shop: [['h', 166], ['i', 82], ['j', 991]],
            society: [['k', 15], ['l', 1000]],
            holiday: [['m', 191239], ['n', 9912]]
        }

        this.data = ['bills', 'food', 'general', 'holiday', 'social']
            .reduce((data, category) => {
                data[category] = { ...testData };

                return data;
            }, {});

        this.dataDeep = {
            food: {
                category: [
                    { item: 'Flour', itemCol: 'Bread', cost: 80 },
                    { item: 'Eggs', itemCol: 'Dairy', cost: 130 }
                ]
            }
        };
    }
    query(sql, ...args) {
        const rawQuery = super.query(sql, ...args);

        const analysisMatch = rawQuery.match(new RegExp([
            String('^SELECT (\\w+) AS itemCol, SUM\\(cost\\) AS cost'),
            'FROM (\\w+)',
            'WHERE (.*) AND uid = 1',
            'GROUP BY itemCol'
        ].join(' ')));

        if (analysisMatch) {
            const groupBy = analysisMatch[1];
            const category = analysisMatch[2];

            return this.data[category][groupBy].map(item => {
                return { itemCol: item[0], cost: item[1] };
            });
        }

        const analysisDeepMatch = rawQuery.match(new RegExp([
            String('^SELECT item, (\\w+) AS itemCol, SUM\\(cost\\) AS cost'),
            'FROM (\\w+)',
            'WHERE (.*) AND uid = 1 AND cost > 0',
            'GROUP BY item, itemCol',
            'ORDER BY itemCol'
        ].join(' ')));

        if (analysisDeepMatch) {
            const groupBy = analysisDeepMatch[1];
            const category = analysisDeepMatch[2];

            return this.dataDeep[category][groupBy];
        }

        return rawQuery;
    }
}

module.exports = {
    Req,
    Res,
    DummyExpress,
    DummyDb,
    DummyDbWithUser,
    testPricesQueryResponse,
    testTransactionsQueryResponse,
    DummyDbWithFunds,
    DummyDbWithListOverview,
    DummyDbWithListOverviewDelay,
    DummyDbWithAnalysis
}
