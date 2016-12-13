'use strict';
module.exports = function(grunt) {
	grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
		babel: {
			compile: {
				options: {
					sourceMap: true,
					presets: ['es2015']
				},
				files: {
          'web/js/src/budget.es5.js': 'web/js/src/budget.js'
				}
			}
		},
    uglify: {
      options: {
        banner: '/*! <%= pkg.name %> <%= grunt.template.today("yyyy-mm-dd") %> */\n'
      },
      build: {
        src: ['web/js/src/budget.es5.js'],
        dest: 'web/js/min/budget.min.js'
      }
    },
    concat: {
      options: {
        separator: ';',
      },
      dist: {
        src: [
          'web/js/min/jquery.min.js',
          'web/js/min/js.cookie.min.js',
          'web/js/min/budget.min.js'
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
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-less');
  grunt.loadNpmTasks('grunt-contrib-cssmin');

  grunt.registerTask('compile_js', ['babel', 'uglify']);
  grunt.registerTask('build_js', ['compile_js', 'concat']);

  grunt.registerTask('build_css', ['less', 'cssmin']);

	grunt.registerTask('default', ['build_js', 'build_css']);
};
