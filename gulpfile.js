const gulp = require('gulp');
const concat = require('gulp-concat');
const uglify = require('gulp-uglify');
const rename = require('gulp-rename');
const cssClean = require('gulp-clean-css');
const htmlMin = require('gulp-htmlmin');
const babel = require('gulp-babel');
const rev = require('gulp-rev');
const revCollector = require('gulp-rev-collector');
const connect = require('gulp-connect');//引入gulp-connect模块
const clean = require('gulp-clean');

gulp.task('connect', function () {
  connect.server({
    root: 'dist',
    port: 4000,
    livereload: true
  });
});


// 合并js
function concatJs() {
  // 有 return 是异步，无 return 是同步
  return gulp.src('./js/*.js') // 将数据读取到内存中
    .pipe(concat('dist.js'))  // 临时合并文件
    .pipe(babel({
      presets: ['@babel/env']
    }))
    .pipe(uglify()) // 压缩文件
    .pipe(rename({suffix: '.min'})) // 改名
    .pipe(rev())//添加hash后缀
    .pipe(gulp.dest('./dist/js')) // 输出文件
    .pipe(rev.manifest())//生成文件映射
    .pipe(gulp.dest('rev/js'))//将映射文件导出到rev/css
    .pipe(connect.reload());
}


// 合并并压缩 css文件
function css() {
  return gulp.src('./css/*.css') // 将数据读取到内存中
    .pipe(concat('dist.css')) // 合并文件
    .pipe(rename({suffix: '.min'})) // 改名
    .pipe(cssClean({compatibility: 'ie8'}))
    .pipe(rev())//添加hash后缀
    .pipe(gulp.dest('./dist/css')) // 输出文件
    .pipe(rev.manifest())//生成文件映射
    .pipe(gulp.dest('rev/css'))//将映射文件导出到rev/css
    .pipe(connect.reload());
}

// 压缩html
function html() {
  return gulp.src('./*.html') // 将数据读取到内存中
    .pipe(htmlMin({collapseWhitespace: true}))
    .pipe(gulp.dest('./dist'))
    .pipe(connect.reload());
}

function revs() {
  return gulp.src(['rev/**/*.json', 'dist/*.html'])
    .pipe(revCollector({
      replaceReved: true,//允许替换, 已经被替换过的文件
      dirReplacements: {
        'css': './css',
        'js': './js',
        'cdn/': function (manifest_value) {
          return '//cdn' + (Math.floor(Math.random() * 9) + 1) + '.' + 'exsample.dot' + '/img/' + manifest_value;
        }
      }
    }))
    .pipe(gulp.dest('dist'))
    .pipe(connect.reload());
}

function img() {
  return gulp.src('./img/*.*')
    .pipe(gulp.dest('./dist/img'))
}

gulp.task('clean', function () {
  return gulp.src('dist', {read: false, allowEmpty: true})
    .pipe(clean())
});

function watch() {
  gulp.watch(['*.html'], gulp.series(html,revs));
  gulp.watch(['./js/*.js'], gulp.series(concatJs, html, revs));
  gulp.watch(['./css/*.css'], gulp.series(css, html, revs))
}


gulp.task('build',
  gulp.series(
    'clean',
    concatJs,
    css,
    img,
    html,
    revs,
  ),
);

gulp.task('watch',
  gulp.parallel('connect', watch)
);
