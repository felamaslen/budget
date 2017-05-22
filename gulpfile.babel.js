/**
 * Code processor / entry point for development app
 */

import path from 'path';
import gulp from 'gulp';
import gutil from 'gulp-util';
import rename from 'gulp-rename';
import less from 'gulp-less';
import concat from 'gulp-concat';
import cssmin from 'gulp-cssmin';
import eslint from 'gulp-eslint';
import uglify from 'gulp-uglify';
import pump from 'pump';
import morgan from 'morgan';
import webpack from 'webpack';
import WebpackDevServer from 'webpack-dev-server';

import webpackConfigDev from './webpack/webpack.development.config';
import webpackConfig from './webpack/webpack.staging.config';

import { WEB_URI } from './local.conf';

const PORT_DEVSERVER = 8080;

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
  .pipe(rename('main.min.css'))
  .pipe(gulp.dest('web/build/css/'));
});

// verify es6 code is good
gulp.task('lint', () => {
  return gulp.src('web/src/js/**')
  .pipe(eslint({
    'plugins': ['react']
  }))
  .pipe(eslint.format())
  .pipe(eslint.failOnError());
});

// process es6 to es5 using babel
gulp.task('webpack', ['lint'], callback => {
  webpack(webpackConfig, (err, stats) => {
    if (err) {
      throw new gutil.PluginError('webpack', err);
    }
    gutil.log('[webpack]', stats.toString());
    callback();
  });
});

// process and minify js
gulp.task('build_js', ['webpack'], callback => {
  pump([
    gulp.src('web/build/js/main.js'),
    uglify(),
    gulp.dest('web/js/build/')
  ], callback);
});

/**
 * Builds the web client files, which are then served by nginx via
 * the uwsgi/python app
 */
gulp.task('production', ['build_css', 'build_js']);

/**
 * Development server
 * Redirects the JS files on the client to a webpack-dev-server which are
 * hot-reloaded
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
    proxy: {
      '/**': {
        target: WEB_URI,
        secure: false,
        changeOrigin: true,
        /*
        bypass: (req, res, proxyOptions) => {
          if (req._parsedUrl.pathname === '/js/main.js') {
            return 'main.js';
          }
        }
        */
      }
    }
  });

  app.use(morgan('dev'));
  app.listen(PORT_DEVSERVER);
  console.log('Development server listening on port', PORT_DEVSERVER);
});

gulp.task('dev', ['less', 'watch_css', 'dev_server']);

gulp.task('default', ['production']);

