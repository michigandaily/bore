const { parallel, src, dest } = require("gulp");
const uglify = require("gulp-uglify");
const babel = require("gulp-babel");
const concat = require("gulp-concat");
const sass = require("gulp-sass");
const cleanCSS = require("gulp-clean-css");

var paths = {
  styles: {
    src: ["src/*.css", "src/*.scss"],
    dest: "dist/",
  },
  scripts: {
    src: "src/*.js",
    dest: "dist/",
  },
};

function styles() {
  return src(paths.styles.src, { sourcemaps: true })
    .pipe(sass())
    .pipe(cleanCSS())
    .pipe(dest(paths.scripts.dest));
}

function scripts() {
  return src(paths.scripts.src, { sourcemaps: true })
    .pipe(
      babel({
        presets: ["@babel/env"],
      })
    )
    .pipe(uglify())
    .pipe(concat("bore.min.js"))
    .pipe(dest(paths.scripts.dest));
}

exports.default = parallel(scripts, styles);
