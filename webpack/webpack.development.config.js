require('dotenv').config();
const path = require('path');
const webpack = require('webpack');
const moduleConfig = require('./module.config');

module.exports = {
  devtool: 'source-map',
  entry: [
    'webpack-dev-server/client?http://0.0.0.0:' + process.env.PORT_WDS,
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

