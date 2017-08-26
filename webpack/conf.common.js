const path = require('path');

const plugins = require('./plugin.common');

module.exports = {
    entry: ['./web/src/index'],
    output: {
        path: path.join(__dirname, '../web/build'),
        filename: 'js/main.js'
    },
    resolve: {
        extensions: ['*', '.js', '.jsx', '.scss']
    },
    plugins
};

