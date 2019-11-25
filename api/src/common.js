const sqlConcat = (...args) => args.join(' || ');

class ErrorBadRequest extends Error {
    constructor(message, code = 400) {
        super(message);

        this.statusCode = code;
    }
}

module.exports = {
    sqlConcat,
    ErrorBadRequest,
};
