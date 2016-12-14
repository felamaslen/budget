var path = require('path');

module.exports = {
  entry: './web/js/src/budget.js',
  output: {
    path: path.join(__dirname, 'web', 'js'),
    publicPath: '/js/',
    filename: 'main.js'
  },
  module: {
    loaders: [
      {
        test: /\.js$/,
        loader: 'babel-loader',
        exclude: /node_modules/,
        query: {
          presets: ['es2015']
        }
      }
    ]
  },
  resolve: {
    root: path.join(__dirname, 'web', 'js', 'src')
  },
  stats: {
    colors: true,
    modules: true,
    reasons: true
  },
  progress: true
}

