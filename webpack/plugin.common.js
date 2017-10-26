const ExtractTextPlugin = require('extract-text-webpack-plugin');

module.exports = [
    new ExtractTextPlugin('css/style.css', {
        allChunks: true
    })
];

