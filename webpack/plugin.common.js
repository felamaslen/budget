const path = require('path');
const Dotenv = require('dotenv-webpack');
const ExtractTextPlugin = require('extract-text-webpack-plugin');

module.exports = [
    new Dotenv({
        path: path.join(__dirname, '../.env'),
        safe: true
    }),
    new ExtractTextPlugin('css/style.css', {
        allChunks: true
    })
];

