const path = require('path');

const gulp = require('gulp');
const loadPlugins = require('gulp-load-plugins');
const $ = loadPlugins();

const SCSS_OPTS = {
  includePaths: ['./node_modules'],
};

const AP_OPTS = {
  browsers: ['last 5 versions'],
};

const _getInjectStreamFor = componentName => [
  gulp.src(path.join('scss', componentName, '*.scss'), {
    read: false,
  }),
  {
    name: componentName,
    relative: true,
    // Disable inject logging
    quiet: true,
    // removeTags: true,
    // https://github.com/klei/gulp-inject/issues/135
    // empty: true
  },
];

gulp.task('css', _done =>
  gulp
    .src('scss/*.scss')
    .pipe($.inject(..._getInjectStreamFor('layout')))
    .pipe($.inject(..._getInjectStreamFor('components')))
    .pipe($.inject(..._getInjectStreamFor('scenes')))
    .pipe($.inject(..._getInjectStreamFor('themes')))
    .pipe($.inject(..._getInjectStreamFor('overrides')))
    .pipe($.sourcemaps.init())
    .pipe($.sass(SCSS_OPTS).on('error', $.sass.logError))
    .pipe($.autoprefixer(AP_OPTS))
    .pipe($.sourcemaps.write('.'))
    .pipe(gulp.dest('static/css'))
);

gulp.task('css:prod', _done =>
  gulp
    .src('scss/*.scss')
    .pipe($.inject(..._getInjectStreamFor('layout')))
    .pipe($.inject(..._getInjectStreamFor('components')))
    .pipe($.inject(..._getInjectStreamFor('scenes')))
    .pipe($.inject(..._getInjectStreamFor('themes')))
    .pipe($.inject(..._getInjectStreamFor('overrides')))
    .pipe($.sass(SCSS_OPTS).on('error', $.sass.logError))
    .pipe($.autoprefixer(AP_OPTS))
    .pipe($.rev())
    .pipe(gulp.dest('static/css'))
    .pipe(
      $.rev.manifest('css.json', {
        merge: true,
      })
    )
    .pipe(gulp.dest('data/manifest'))
);

gulp.task('css:watch', _done =>
  gulp.watch('scss/**/*.scss', gulp.series('css'))
);

gulp.task('img:rev', _done =>
  gulp
    .src([
      '{images,content}/**/*.{jpg,jpeg,png,svg}',
      '!**/*-[0-9a-z][0-9a-z][0-9a-z][0-9a-z][0-9a-z][0-9a-z][0-9a-z][0-9a-z][0-9a-z][0-9a-z].*',
    ])
    .pipe($.filelog())
    .pipe($.rev())
    .pipe(gulp.dest('.'))
    .pipe($.revNapkin())
);

gulp.task('img:copy', _done =>
  gulp
    .src(['images/**/*.{jpg,jpeg,png,svg}'])
    .pipe($.changed('static/images'))
    .pipe($.filelog())
    .pipe(gulp.dest('static/images'))
);

gulp.task('img:watch', _done =>
  gulp.watch('{images,content}/**/*.{jpg,jpeg,png,svg}', gulp.series('img'))
);

gulp.task('img', gulp.series(['img:rev', 'img:copy']));

gulp.task(
  'watch',
  gulp.series(
    gulp.parallel('img', 'css'),
    gulp.parallel('img:watch', 'css:watch')
  )
);

gulp.task('build', gulp.parallel('img', 'css:prod'));
