var gulp = require('gulp'),
  rename = require('gulp-rename'),
  uglify = require('gulp-uglify'),
  notify = require('gulp-notify'),
  babel  = require('gulp-babel'),
  browserify = require('browserify'),
  source = require('vinyl-source-stream'),
  buffer = require('vinyl-buffer')

gulp.task( 'default', function() {
  
  var b = browserify({
    entries:'./js/index.js',
    transforms:['glslify']
  })

  // bundles files and
  // converts results to stream object  
  b.bundle()
    // converts to vinyl stream
    .pipe( notify({
      message: 'begin.',
      onLast:true
    }) )
    .pipe( source( 'app.js' ) )
    .pipe( notify({
      message: 'app.js build complete.',
      onLast:true
    }) )
    // buffer entire vinyl object
    .pipe( buffer() )
    .pipe( notify({
      message: 'buffer complete.',
      onLast:true
    }) )
    .pipe( babel({ presets:['es2015'] }) )
    .pipe( notify({
      message: 'babel complete.',
      onLast:true
    }) )
    .pipe( uglify() )
    .pipe( notify({
      message: 'uglify complete.',
      onLast:true
    }) )
    .pipe( gulp.dest('./dist') )
    .pipe( notify({
      message: 'build complete.',
      onLast:true
    }) )
})

gulp.task( 'watch', function() {
  gulp.watch( './js/**.js', function() {
    gulp.run('default')
  })
})
