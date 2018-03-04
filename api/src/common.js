/**
 * Common methods / functions
 */

class ErrorBadRequest extends Error {
    constructor(message, code = 400) {
        super(message);

        this.statusCode = code;
    }
}

module.exports = {
    ErrorBadRequest
};

