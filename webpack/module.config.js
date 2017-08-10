module.exports = {
  loaders: [
    {
      test: /\.jsx$|\.js$/,
      exclude: /node_modules/,
      loader: 'babel-loader',
      query: {
        presets: ['react', 'es2015']
      }
    },
    { test: /\.woff(2)?(\?v=[0-9]\.[0-9]\.[0-9])?$/, loader: 'url?limit=10000&minetype=application/font-woff' },
    { test: /\.(ttf|eot|svg|png|jpg)(\?v=[0-9]\.[0-9]\.[0-9])?$/, loader: 'file' },
    { test: /\.less$/, loader: 'style!css!autoprefixer!less' }
  ]
};

