module.exports = function(grunt) {

  // Using MatchDep so I don't have to register each task by hand
  require("matchdep").filterDev("grunt-*").forEach(grunt.loadNpmTasks); 

  // Configure the project
  grunt.initConfig({
  	pkg: grunt.file.readJSON('package.json'),

    // Set up variable paths
    appPaths: {
      src: './src',
      dist: './dist'
    },

    // Run these tasks in parallel
    concurrent: {
      dist: [
        'imagemin',
        'svgmin',
        'htmlmin'
      ]
    },
    clean: {
      dist: '<%= appPaths.dist %>'
    },
    // Configure each module
    watch: {
      // Watch my CSS and JS, and run the minify and uglify tasks when they change
      files: [
        '<%= appPaths.src %>/lib/css/*.css',
        '<%= appPaths.src %>/lib/js/*.js',
        '<%= appPaths.src %>/lib/images/**/*.{png,jpg,jpeg}',
        '<%= appPaths.src %>/lib/images/**/*.svg',
        '<%= appPaths.src %>/**/*.html'
      ],
      tasks: ['clean','cssmin','uglify','imagemin','svgmin','htmlmin','cacheBust']
    },

    cssmin: {

      sitecss: {
        options: {
          banner: ''
        },
        files: {
          'dist/app.min.css': [
            '<%= appPaths.src %>/lib/css/RB.css',
            '<%= appPaths.src %>/lib/css/app.css'
          ]
        }
      }

    },

    uglify: {
      options: { 
          compress: true,
          mangle: {
            reserved: ['APP'], // Exclude mangling APP
            toplevel: true,
            // properties: true,
            eval: true
          },
          wrap: 'APP'
      }, 
      applib: { 
          src: [ 
            '<%= appPaths.src %>/lib/js/RB.js',
            '<%= appPaths.src %>/lib/js/app.js'            
          ], 
          dest: '<%= appPaths.dist %>/app.min.js' 
      } 

    },
    imagemin: {

      dist: {
        files: [{
          expand: true,
          cwd: '<%= appPaths.src %>/lib/images/',
          src: '**/*.{png,jpg,jpeg}',
          dest: '<%= appPaths.dist %>'
        }]
      }

    },
    svgmin: {
      dist: {
        files: [{
          expand: true,
          cwd: '<%= appPaths.src %>/lib/images/',
          src: '**/*.svg',
          dest: '<%= appPaths.dist %>'
        }]
      }
    },

    htmlmin: {
      dist: {
        options: {
        },
        files: [{
          expand: true,
          cwd: '<%= appPaths.src %>',
          src: '**/*.html',
          dest: '<%= appPaths.dist %>'
        }]
      }
    },

    cacheBust: {

      assets: {

        options: {
            baseDir: '<%= appPaths.dist %>',
            assets: ['**/*.{png,jpg,jpeg,svg,css,js}'],
        },
        files: [{   
            expand: true,
            cwd: '<%= appPaths.dist %>',
            src: ['**/*.html','**/*.css']
        }]

      }

    }

  });

  grunt.registerTask('default', ['clean','cssmin','uglify','imagemin','svgmin','htmlmin','cacheBust']);

};