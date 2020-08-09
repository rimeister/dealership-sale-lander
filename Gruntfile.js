module.exports = function(grunt) {

  grunt.initConfig({
  	pkg: grunt.file.readJSON('package.json'),

    watch: {
      files: "less/*.less",
      tasks: ["less"]
    },

    less: {
    	development: {
    		options: {
    			paths: [""]
    		},
    		files: {
    			"style.css" : "less/main.less"
    		}
    	}
    }

  });

  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-less');

  grunt.registerTask('default', ['watch']);

};