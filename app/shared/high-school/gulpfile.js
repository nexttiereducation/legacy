var gulp = require('gulp');
var concat = require('gulp-concat');
var rename = require('gulp-rename');
var uglify = require('gulp-uglify');
var less = require('gulp-less');
var minify = require('gulp-minify-css');
var ngHtml2Js = require("gulp-ng-html2js");
var clean = require('gulp-clean');

gulp.task('default', ['build']);

gulp.task('build', ['cleanup']);

gulp.task('clear-build', function() {
    return gulp.src('dist', {read: false})
        .pipe(clean());
});

gulp.task('html', ['clear-build'], function() {
    return gulp.src('source/*.html')
        .pipe(ngHtml2Js({
            moduleName: "high-school"
        }))
        .pipe(concat('templates.js'))
        .pipe(gulp.dest("./temp"));
});

gulp.task('scripts', ['html'], function() {
    return gulp.src(['source/*.module.js','temp/*.js','source/*.js'])
        .pipe(concat('high-school.js'))
        .pipe(gulp.dest('dist'))
        .pipe(rename('high-school.min.js'))
        .pipe(uglify())
        .pipe(gulp.dest('./dist'));
});

gulp.task('less', ['scripts'], function() {
   return gulp.src('source/*.less')
       .pipe(less())
       .pipe(minify())
       .pipe(concat('high-school.min.css'))
       .pipe(gulp.dest('./dist'));
});

gulp.task('cleanup', ['less'], function() {
    return gulp.src('temp', {read: false})
        .pipe(clean());
});

