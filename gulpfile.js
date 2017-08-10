/**
 * Code processor / entry point for development app
 */

require('dotenv').config();
const path = require('path');
const nodemon = require('nodemon');
const gulp = require('gulp');
const gutil = require('gulp-util');
const rename = require('gulp-rename');
const less = require('gulp-less');
const concat = require('gulp-concat');
const cssmin = require('gulp-cssmin');
const eslint = require('gulp-eslint');
const uglify = require('gulp-uglify');
const pump = require('pump');
const morgan = require('morgan');
const webpack = require('webpack');
const WebpackDevServer = require('webpack-dev-server');

const webpackConfigDev = require('./webpack/webpack.development.config');
const webpackConfig = require('./webpack/webpack.staging.config');

// less css preprocessor
gulp.task('less', () => {
  return gulp.src('web/src/less/**/*.less')
  .pipe(less({
    paths: [path.join(__dirname, 'web', 'src', 'less')]
  }))
  .pipe(gulp.dest('web/build/css'));
});

// watch less files for changes
gulp.task('watch_css', () => {
  gulp.watch('web/src/less/**/*.less', ['less']);
});

// process and minify less
gulp.task('build_css', ['less'], () => {
  return gulp.src('web/build/css/main.css')
  .pipe(cssmin())
  .pipe(gulp.dest('web/build/css/'));
});

// verify es6 code is good
gulp.task('lint', () => {
  return gulp.src('web/src/js/**')
  .pipe(eslint())
  .pipe(eslint.format())
  .pipe(eslint.failOnError());
});

// process es6 to es5 using babel
gulp.task('webpack', ['lint'], callback => {
  webpack(webpackConfig, (err, stats) => {
    if (err) {
      throw new gutil.PluginError('webpack', err);
    }
    gutil.log('[webpack]', stats.toString({ chunks: false, modules: false }));
    callback();
  });
});

// process js
gulp.task('build_js', ['webpack']);

/**
 * Builds the web client files, which are then served by nginx via
 * the uwsgi/python app
 */
gulp.task('build', ['build_css', 'build_js']);

/**
 * Production server
 */
gulp.task('server', () => {
  const monitor = nodemon({
    'script': './srv/index.js',
    'ignore': './web/build/js/*.js'
  });

  process.once('SIGINT', () => {
    monitor.once('exit', () => {
      process.exit();
    });
  });
});

/**
 * Development server
 * Redirects the JS files on the client to a webpack-dev-server
 * with hot reloading
 */
gulp.task('dev_server', callback => {
  const app = new WebpackDevServer(webpack(webpackConfigDev), {
    publicPath: webpackConfig.output.publicPath,
    hot: true,
    quiet: false,
    noInfo: false,
    stats: {
      colors: true,
      modules: false,
      chunks: false,
      reasons: true
    },
    progress: true,
    proxy: { // proxy to the express app
      '/**': {
        target: `http://localhost:${process.env.PORT}`,
        secure: false,
        changeOrigin: false,
      }
    },
    disableHostCheck: true
  });

  app.use(morgan('dev'));
  app.listen(process.env.PORT_WDS);
  console.log('Development server listening on port', process.env.PORT_WDS);
});

gulp.task('dev', ['less', 'watch_css', 'server', 'dev_server']);

gulp.task('default', ['production']);

