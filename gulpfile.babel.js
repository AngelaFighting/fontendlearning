/**
 * Created by Angela on 2018/6/18.
 */
'use strict';

import fs from 'fs';

import gulp from 'gulp';
import del from 'del';                      // 删除文件

// Load all gulp plugins automatically
// and attach them to the `plugins` object
import plugins from 'gulp-load-plugins';

import modernizr from 'modernizr';
import modernizrConfig from './modernizr-config.json';

import runSequence from 'run-sequence';
import browserSync from 'browser-sync';

const $ = plugins();
const reload = browserSync.reload;

// 创建删除dist所有文件的任务
gulp.task('clean', (done) => {
  del(['dist']).then(() => {
    done();
  });
});

// 复制指定文件到dist
gulp.task('copy', [
  'copy:.htaccess', // 复制.htaccess文件
  'copy:jquery',    // 复制jQuery js库
  'copy:license',   // 复制证书
  'copy:normalize', // 复制normalize.css
  'copy:common'     // Copy all files at the root level (app)
]);

gulp.task('copy:.htaccess', () =>
  gulp.src('node_modules/apache-server-configs/dist/.htaccess')
    .pipe($.replace(/# ErrorDocument/g, 'ErrorDocument'))
    .pipe(gulp.dest('dist'))
);

gulp.task('copy:license', () =>
  gulp.src('LICENSE')
    .pipe(gulp.dest('dist'))
);

gulp.task('copy:jquery', () =>
  gulp.src(['node_modules/jquery/dist/jquery.min.js'])
    .pipe(gulp.dest('dist/js'))
);

gulp.task('copy:normalize', () => {
  gulp.src('node_modules/normalize.css/normalize.css')
    .pipe(gulp.dest('dist/css'));
});

gulp.task('copy:common', () => {
  gulp.src([
    'src/*.*',
    '!src/index.pug',
    '!src/index.html',
    '!src/404.html',
  ], {
    dot: true
  }).pipe(gulp.dest('dist'));
});

gulp.task('build:modernizr', (done) => {
  modernizr.build(modernizrConfig, (code) => {
    fs.writeFile('dist/js/modernizr.min.js', code, done);
  });
});

// Lint JavaScript js语法检测
gulp.task('lint:js', () => {
  gulp.src(['src/es6/*.babel.js',])
  // eslint() attaches the lint output to the "eslint" property
  // of the file object so it can be used by other modules.
    .pipe($.eslint())
    // eslint.format() outputs the lint results to the console.
    // Alternatively use eslint.formatEach() (see Docs).
    .pipe($.eslint.format())
    // To have the process exit with an error code (1) on
    // lint error, return the stream and pipe to failOnError last.
    .pipe($.if(!browserSync.active, $.eslint.failAfterError()));
});

// Optimize images
gulp.task('minify:img', () =>
  gulp.src('src/img/*')
    .pipe($.cache($.imagemin({
      progressive: true,
      interlaced: true
    })))
    .pipe(gulp.dest('dist/img'))
);

// 编译pug为html
gulp.task('pug', () => {
  gulp.src([
    '!src/pug/_layout.pug',
    'src/pug/*.pug'
  ]).pipe($.pug({
    pretty: true
  })).pipe(gulp.dest('src/view'))
});

// 压缩html
gulp.task('minify:html', () => {
  gulp.src([
    'src/*.html',
    'src/**/*.html',
  ]).pipe($.htmlmin({
    removeComments: true,               //清除HTML注释
    collapseWhitespace: true,           //压缩HTML
    collapseBooleanAttributes: true,    //省略布尔属性的值 <input checked="true"/> ==> <input />
    removeEmptyAttributes: true,        //删除所有空格作属性值 <input id="" /> ==> <input />
    removeScriptTypeAttributes: true,   //删除<script>的type="text/javascript"
    removeStyleLinkTypeAttributes: true,//删除<style>和<link>的type="text/css"，
    minifyJS: true,                     //压缩页面JS
    minifyCSS: true                     //压缩页面CSS
  })).pipe(gulp.dest('dist'))
});

// 顺序编译pug为html，然后压缩html
gulp.task('html', (done) => {
  runSequence('pug', 'minify:html', done);
});

// 编译scss为css
gulp.task('scss', () => {
  gulp.src('src/scss/*.scss')
    .pipe($.sass({
      outputStyle: 'expanded'
    })).pipe(gulp.dest('src/css'))
});

// autoprefixer css和压缩css
gulp.task('minfy:css', () => {
  gulp.src('src/css/*.css')
    .pipe($.autoprefixer({
      browsers: ['last 2 versions', 'ie >= 9', '> 1%'],
      cascade: false
    }))
    .pipe($.csso())
    .pipe(gulp.dest('dist/css'));
});

// 顺序编译scss为css，然后autoprefixer css和压缩css
gulp.task('css', (done) => {
  runSequence('scss', 'minify:css', done);
});

// 编译es6为es5
gulp.task('es6', () => {
  gulp.src('src/es6/*.babel.js')
    .pipe($.babel({
      presets:'env'
    }))
    .pipe(gulp.dest('src/js'));
});

// 压缩混淆js
gulp.task('minify:js', () => {
  gulp.src('src/js/*.js')
    .pipe($.uglify())
    .pipe(gulp.dest('dist/js'));
});

gulp.task('js', (done) => {
  runSequence('lint:js', 'es6', 'minify:js', done);
});

// Watch files for changes & reload
gulp.task('serve', ['js', 'css', 'html'], () => {
  browserSync({
    notify: false,
    // Customize the Browsersync console logging prefix
    logPrefix: 'WSK',
    // Allow scroll syncing across breakpoints
    scrollElementMapping: ['main', '.mdl-layout'],
    // Run as an https by uncommenting 'https: true'
    // Note: this uses an unsigned certificate which on first access
    //       will present a certificate warning in the browser.
    // https: true,
    server: ['dist'],
    port: 3000
  });

  gulp.watch(['src/*.pug', 'src/**/*.pug'], ['html', reload]);
  gulp.watch(['src/scss/*.scss'], ['css', reload]);
  gulp.watch(['src/es6/*.babel.js'], ['js', reload]);
  gulp.watch(['src/img/**/*'], ['minify:img', reload]);
});

// 将src中的文件编译到dist
gulp.task('build', (done) => {
  runSequence(
    'clean',              // 清除dist
    ['js', 'css', 'html', 'minify:img', 'copy'],  // 编译复制文件
    'modernizer:build'  // 生成modernizer.js
  );
});

// 创建默认任务
gulp.task('default', ['build']);





