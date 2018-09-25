var gulp = require('gulp');
var concat = require('gulp-concat');
var rename = require('gulp-rename');
var uglify = require('gulp-uglify');
var less = require('gulp-less');
var minify = require('gulp-minify-css');
var ngHtml2Js = require("gulp-ng-html2js");
var clean = require('gulp-clean');

gulp.task('default', ['build']);

gulp.task('build', ['less']);

gulp.task('clear-build', ['cleanup'], function() {
    return gulp.src('dist', {read: false})
        .pipe(clean());
});

gulp.task('html', ['clear-build'], function() {
    return gulp.src('source/*.html')
        .pipe(ngHtml2Js({
            moduleName: "feed"
        }))
        .pipe(concat('templates.js'))
        .pipe(gulp.dest('./.tmp'));
});

gulp.task('scripts', ['html'], function() {
    return gulp.src(['source/*.module.js','.tmp/*.js','source/*.js'])
        .pipe(concat('feed.js'))
        .pipe(gulp.dest('dist'))
        .pipe(rename('feed.min.js'))
        .pipe(uglify())
        .pipe(gulp.dest('./dist'));
});

gulp.task('less', ['scripts'], function() {
   return gulp.src('source/*.less')
       .pipe(less())
       .pipe(concat('feed.min.css'))
       .pipe(minify())
       .pipe(gulp.dest('./dist'));
});

gulp.task('cleanup', function() {
    return gulp.src('.tmp', {read: false})
        .pipe(clean());
});

