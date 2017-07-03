var gulp = require('gulp');
var ts = require('gulp-typescript');
var jasmine = require('gulp-jasmine');
var clean = require('gulp-clean');
var runSequence = require('run-sequence');

gulp.task('build', function() {
    var merge = require('merge2');
    var tsProject = ts.createProject('tsconfig.json');

    var tsResult = tsProject.src()
        .pipe(tsProject());

    return merge([
        tsResult.dts.pipe(gulp.dest('./definitions')),
        tsResult.js.pipe(gulp.dest(tsProject.config.compilerOptions.outDir))
    ]);
});

gulp.task('copy:asset', function () {
  var sources = [
      './src/ng2-simple-autocomplete.css',
      './src/ng2-simple-autocomplete.html'
  ];
  return gulp.src(sources)
    .pipe(gulp.dest('dist'))
})

gulp.task('clean', function () {
    return gulp.src(['dist', 'definitions'], { read: false })
        .pipe(clean());
});

gulp.task('test:run', function() {
    return gulp.src('dist/spec/**')
      .pipe(jasmine())
});

gulp.task('watch', ['default'], function() {
    gulp.watch('src/ng2-simple-autocomplete/**/*.ts', ['default']);
});

gulp.task('test', [], function(cb) {
  runSequence('clean', 'build',  'test:run', cb);
});

gulp.task('default', [], function(cb) {
  runSequence('clean', 'build', 'copy:asset', cb);
});
