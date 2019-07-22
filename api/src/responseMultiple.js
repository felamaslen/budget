/**
 * For grouping multiple responses into a larger response
 */

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

module.exports = ResponseMultiple;
