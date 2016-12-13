'use strict';
module.exports = function(grunt) {
	grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    webpack: {
      budget: require('./webpack.config.js')
    },
    uglify: {
      options: {
        banner: '/*! <%= pkg.name %> <%= grunt.template.today("yyyy-mm-dd") %> */\n'
      },
      build: {
        src: ['web/js/main.js'],
        dest: 'web/js/build/bundle.min.js'
      }
    },
    concat: {
      options: {
        separator: ';',
      },
      dist: {
        src: [
          'web/js/src/lib/js.cookie.min.js',
          'web/js/build/bundle.min.js'
        ],
        dest: 'web/js/main.min.js',
      },
    },
    less: {
      development: {
        options: {
          paths: ['resources/less'],
          yuicompress: false
        },
        files: {
          'web/css/budget.css': 'resources/less/budget.less'
        }
      }
    },
    cssmin: {
      compress: {
        files: {
          'web/css/budget.min.css': ['web/css/budget.css']
        }
      }
    }
	});

	grunt.loadTasks('tasks');
  grunt.loadNpmTasks('grunt-webpack');
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-less');
  grunt.loadNpmTasks('grunt-contrib-cssmin');

  grunt.registerTask('compile_js', ['webpack']);
  grunt.registerTask('minify_js', ['uglify', 'concat']);
  grunt.registerTask('build_js', ['compile_js', 'minify_js']);

  grunt.registerTask('build_css', ['less', 'cssmin']);

	grunt.registerTask('default', ['build_js', 'build_css']);
};
