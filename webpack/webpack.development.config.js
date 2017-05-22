import path from 'path';
import webpack from 'webpack';
import moduleConfig from './module.config';

import { PORT_DEVSERVER } from '../web/global.conf';

export default {
  devtool: 'source-map',
  entry: [
    'webpack-dev-server/client?http://localhost:' + PORT_DEVSERVER,
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

