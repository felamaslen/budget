import path from 'path'
import webpack from 'webpack'
import moduleConfig from './module.config'

export default {
  devtool: 'cheap-module-source-map',
  entry: [
    './web/src/js/index.jsx'
  ],
  plugins: [
    new webpack.DefinePlugin({
      "process.env": {
        NODE_ENV: JSON.stringify("production")
      }
    }),
    new webpack.optimize.UglifyJsPlugin({
      compress: {
        warnings: false,
        dead_code: true,
        drop_debugger: true,
        conditionals: true,
        unused: true,
        if_return: true
      },
      mangle: {
        toplevel: true
      }
    })
  ],
  output: {
    path: path.join(__dirname, '../web/build/js'),
    filename: 'main.js'
  },
  module: moduleConfig,
  resolve: {
    extensions: ['', '.js', '.jsx']
  }
};
