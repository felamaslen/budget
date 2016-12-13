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
	});

	grunt.loadTasks('tasks');
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-uglify');

  grunt.registerTask('build', ['babel', 'uglify'])
	grunt.registerTask('default', ['build', 'concat']);
};
