const utils = require('loader-utils');

module.exports = function prependLoader(content) {
    // eslint-disable-next-line no-invalid-this
    const opt = utils.parseQuery(this.query);

    if (opt.data) {
        return opt.data + content;
    }

    return content;
};

