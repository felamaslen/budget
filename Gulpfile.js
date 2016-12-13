'use strict';

var path = require('path');

var concat = require('gulp-concat');
var cssmin = require('gulp-cssmin');
var gulp = require('gulp');
var gutil = require('gulp-util');
var less = require('gulp-less');
var pump = require('pump');
var rename = require('gulp-rename');
var uglify = require('gulp-uglify');
var webpack = require('webpack');
var WebpackDevServer = require('webpack-dev-server');

var webpackOptions = require('./webpack.config');

gulp.task('webpack', function(callback) {
  webpack(webpackOptions, function(err, stats) {
    if (err) {
      throw new gutil.PluginError('webpack', err);
    }
    gutil.log('[webpack]', stats.toString());
    callback();
  });
});

gulp.task('webpack-dev-server', function(callback) {
  var compiler = webpack(webpackOptions);

  new WebpackDevServer(compiler, {
    watch: true,
    proxy: {
      '/**': {
        target: 'https://budget.bristol.fela.london/',
        changeOrigin: true,
        secure: true
      }
    }
  }).listen(8080, '0.0.0.0', function(err) {
      if (err) {
        throw new gutil.PluginError('webpack-dev-server', err);
      }
      gutil.log('[webpack-dev-server]', 'http://localhost:8080/webpack-dev-server/index.html');
  });
});

gulp.task('uglify', function(callback) {
  pump([
    gulp.src('web/js/main.js'),
    uglify(),
    gulp.dest('web/js/build/')
  ], callback);
});

gulp.task('concat', function() {
  return gulp.src([
    'web/js/src/lib/js.cookie.min.js',
    'web/js/build/main.js'
  ]).pipe(concat('main.min.js', {newLine: ';'}))
  .pipe(gulp.dest('web/js/'));
});

gulp.task('less', function() {
  return gulp.src('resources/less/*.less')
  .pipe(less({
    paths: [path.join(__dirname, 'resources', 'less')]
  }))
  .pipe(gulp.dest('web/css'));
});

gulp.task('cssmin', function() {
  gulp.src('web/css/budget.css')
  .pipe(cssmin())
  .pipe(rename({suffix: '.min'}))
  .pipe(gulp.dest('web/css/'))
});

gulp.task('compile_js', ['webpack']);
gulp.task('minify_js', ['uglify', 'concat']);
gulp.task('build_js', ['compile_js', 'minify_js']);

gulp.task('build_css', ['less', 'cssmin']);

gulp.task('default', ['build_js', 'build_css']);

