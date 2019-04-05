function sqlConcat(...args) {
    if (process.env.NODE_ENV === 'test') {
        // SQLite concatenation
        return args.join(' || ');
    }

    // MySQL concatenation
    return `CONCAT(${args.join(', ')})`;
}

class ErrorBadRequest extends Error {
    constructor(message, code = 400) {
        super(message);

        this.statusCode = code;
    }
}

module.exports = {
    sqlConcat,
    ErrorBadRequest
};

