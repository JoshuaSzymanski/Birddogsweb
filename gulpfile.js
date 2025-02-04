const gulp = require('gulp');
const clean = require('gulp-clean');
const cssnano = require('gulp-cssnano');
const uglify = require('gulp-uglify');
const ffmpeg = require('fluent-ffmpeg');
const through2 = require('through2');

// Dynamic import for gulp-imagemin
async function loadImagemin() {
    const imagemin = await import('gulp-imagemin');
    return imagemin.default;
}

// Clean the build directory
gulp.task('clean', function () {
    return gulp.src('build', { allowEmpty: true, read: false })
        .pipe(clean());
});

// Minify CSS files
gulp.task('minify-css', function () {
    return gulp.src('src/css/*.css')
        .pipe(cssnano())
        .pipe(gulp.dest('build/css'));
});

// Minify JavaScript files
gulp.task('minify-js', function () {
    return gulp.src('src/js/*.js')
        .pipe(uglify())
        .pipe(gulp.dest('build/js'));
});

// Optimize images
gulp.task('optimize-images', async function () {
    const imagemin = await loadImagemin();
    return gulp.src('src/images/*')
        .pipe(imagemin())
        .pipe(gulp.dest('build/images'));
});

// Compress video files
gulp.task('compress-videos', function () {
    return gulp.src('src/videos/*')
        .pipe(through2.obj(function (file, _, cb) {
            ffmpeg(file.path)
                .outputOptions('-c:v libx264')
                .outputOptions('-crf 28')
                .outputOptions('-preset fast')
                .outputOptions('-c:a aac')
                .outputOptions('-b:a 128k')
                .save(file.path.replace('src/videos', 'build/videos'))
                .on('end', cb)
                .on('error', cb);
        }));
});

// Default task to run all tasks
gulp.task('default', gulp.series('clean', gulp.parallel('minify-css', 'minify-js', 'optimize-images', 'compress-videos')));
