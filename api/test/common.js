/**
 * Common stuff for testing
 */

const mysql = require('mysql');

class Req {
    constructor(options) {
        this.path = options.path;
        this.method = options.method || 'get';
        this.params = options.params || {};
        this.form = options.form || {};
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
    end(string) {
        this.response = string.toString();
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
    use(pathParam, callbackParam) {
        const path = callbackParam
            ? pathParam
            : null;
        const callback = callbackParam || pathParam;

        const method = 'middleware';

        this.routes.push({ method, path, callback });
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
}

class DummyDb {
    constructor() {
        this.queries = [];
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
}

module.exports = {
    Req,
    Res,
    DummyExpress,
    DummyDb
}
