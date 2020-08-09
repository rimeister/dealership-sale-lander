module.exports = function(grunt) {

  // Using MatchDep so I don't have to register each task by hand
  require("matchdep").filterDev("grunt-*").forEach(grunt.loadNpmTasks); 

  // Configure the project
  grunt.initConfig({
  	pkg: grunt.file.readJSON('package.json'),

    // Configure each module
    watch: {
      // Watch my CSS and JS, and run the minify and uglify tasks when they change
      files: ["src/lib/css/*.css","src/lib/js/*.js"],
      tasks: ["cssmin"/*,"uglify"*/]
    },

    copy: {

    },

    cssmin: {

      sitecss: {
        options: {
          banner: ''
        },
        files: {
          'dist/app.min.css': [
            './src/lib/css/RB.css',
            './src/lib/css/app.css'
          ]
        }
      }

    }/*,

    uglify: {



    },



*/


  // Make a build task, transfer over HTML on watch too
  // Transfer images
  // Add cache-busting



    /*
    
    less: {
    	development: {
    		options: {
    			paths: [""]
    		},
    		files: {
    			"dist/app.css" : "scr/lib/css/*"
    		}
    	}
    }
  */




  });

  // grunt.loadNpmTasks('grunt-contrib-watch');
  // grunt.loadNpmTasks('grunt-contrib-less');

  grunt.registerTask('default', ['watch']);

};