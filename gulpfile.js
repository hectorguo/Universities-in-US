// Include gulp
var gulp = require('gulp'); 

// Include Our Plugins
var $ = require('gulp-load-plugins')();
var del = require('del');
var runSequence = require('run-sequence');
var mainBower = require('main-bower-files');
var browserSync = require('browser-sync');
var reload = browserSync.reload;

var allJs = mainBower();
allJs.push('app/app.js');

// Lint Task
gulp.task('lint', function() {
    return gulp.src('app/app.js')
        .pipe($.jshint())
        .pipe($.jshint.reporter('default'));
});

// Concat and Compress scripts
gulp.task('scripts', ['lint'], function(){
  return gulp.src(allJs)
    .pipe($.concat('app/app.js'))
    .pipe($.rename('app.min.js'))
    .pipe($.uglify())
    .pipe(gulp.dest('dist'));
});

// Concat html src
gulp.task('html', function(){
  return gulp.src('app/index.html')
    .pipe($.htmlReplace({
      js: 'app.min.js',
      css: 'style.min.css'
    }))
    .pipe($.minifyHtml({
      quotes: true,
      empty: true,
      spare: true
    }))
    .pipe(gulp.dest('dist'));
});

// compress css
gulp.task('css', function(){
  return gulp.src('app/*.css')
    .pipe($.minifyCss())
    .pipe($.rename('style.min.css'))
    .pipe(gulp.dest('dist'));
});

// Transfer data
gulp.task('data', function(){
  return gulp.src('app/us.json')
    .pipe(gulp.dest('dist'));
})

gulp.task('clean', function(){
  del(['.tmp','dist']);
})

// Watch Files For Changes
gulp.task('serve', function() {

    gulp.watch(allJs, ['scripts']);
    gulp.watch('app/*.css', ['css']);
    gulp.watch('app/index.html', ['html']);
    // gulp.watch('scss/*.scss', ['sass']);
});

// Watch files for changes & reload
gulp.task('serve', function () {
  browserSync({
    port: 3001,
    notify: false,
    // Run as an https by uncommenting 'https: true'
    // Note: this uses an unsigned certificate which on first access
    //       will present a certificate warning in the browser.
    // https: true,
    server: {
      baseDir: ['.tmp', 'app'],
      routes: {
        '/bower_components': 'bower_components'
      }
    }
  });

  gulp.watch('app/*.*', reload);
  // gulp.watch('scss/*.scss', ['sass']);
});

  // Watch files for changes & reload
gulp.task('serve:dist', ['default'], function () {
  browserSync({
    port: 3000,
    notify: false,
    // Run as an https by uncommenting 'https: true'
    // Note: this uses an unsigned certificate which on first access
    //       will present a certificate warning in the browser.
    // https: true,
    server: {
      baseDir: 'dist'
    }
  });

  gulp.watch(allJs, ['scripts', reload]);
  gulp.watch('app/*.css', ['css', reload]);
  gulp.watch('app/index.html', ['html', reload]);
  // gulp.watch('scss/*.scss', ['sass']);
});

gulp.task('default', function(){
  runSequence('clean',['data','scripts','html','css']);
});