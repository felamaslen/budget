const path = require('path');
const webpack = require('webpack');
const moduleConfig = require('./module.config');

const PORT_DEVSERVER = require('../web/global.conf').PORT_DEVSERVER;

module.exports = {
  devtool: 'source-map',
  entry: [
    'webpack-dev-server/client?http://0.0.0.0:' + PORT_DEVSERVER,
    'webpack/hot/only-dev-server',
    './web/src/js/index.jsx'
  ],
  output: {
    path: path.join(__dirname, 'dist'),
    filename: 'js/main.js'
  },
  resolve: {
    extensions: ['', '.js', '.jsx']
  },
  plugins: [
    new webpack.HotModuleReplacementPlugin()
  ],
  module: moduleConfig
};

