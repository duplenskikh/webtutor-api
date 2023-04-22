import { dest, src, task, watch } from "gulp";
import { createProject } from "gulp-typescript";
import { join } from "path";
import del from "del";
import rename from "gulp-rename";
const stripImportExport = require("gulp-strip-import-export");
import change from "gulp-change";
import header from "gulp-header";
import { SRC_PATH, IMPORT_REGEXP, TS_CONFIG_PATH, WATCHED_TS_TYPES, BUILD_PATH, EXPORT_REGEXP } from "./gulp/consts";
import { deploy } from "./gulp/plugins";

const removeImportsExports = (content: string) => content.replace(IMPORT_REGEXP, "// $1").replace(EXPORT_REGEXP, "// $1");

const transformTS = (path: string) => {
  return src(path, { base: SRC_PATH })
    .pipe(change(removeImportsExports))
    .pipe(createProject(TS_CONFIG_PATH)())
    .on("error", (error) => console.log(`Transpilation error: ${error}`))
    .pipe(stripImportExport())
    .on("end", () => console.log(`🔧 File "${path}" transpiled successfully`))
};

task("dev", (done) => {
  WATCHED_TS_TYPES
    .forEach(x => {
      watch(x).on("change", (path: string) => {
        transformTS(path)
          .pipe(header("\ufeff"))
          .pipe(dest(BUILD_PATH))
          .pipe(deploy(path))
      });

      console.log(`💂 Watcher on "${x}" have started`);
    });

  watch(join(SRC_PATH, "api.ts"))
    .on("change", (path) => {
      transformTS(path)
        .pipe(change((content) => `<%\n${content}\n%>\n`))
        .pipe(rename({
          extname: ".html"
        }))
        .pipe(header("\ufeff"))
        .pipe(dest(BUILD_PATH))
        .pipe(deploy(path))
    });

  console.log(`💂 Watcher on "${join(SRC_PATH, "api.ts")}" have started`);

  watch(join(SRC_PATH, "index.xml"))
    .on("change", (path: string) => {
      src(path, { base: SRC_PATH })
        .pipe(header("\ufeff"))
        .pipe(dest(BUILD_PATH));
    });

  console.log(`💂 Watcher on "${join(SRC_PATH, "index.xml")}" have started`);

  watch(join(SRC_PATH, "index.ts"))
    .on("change", (path: string) => {
      transformTS(path)
        .pipe(rename({
          extname: ".bs"
        }))
        .pipe(header("\ufeff"))
        .pipe(dest(BUILD_PATH))
        .pipe(deploy(path));
    });

  console.log(`💂 Watcher on "${join(SRC_PATH, "index.ts")}" have started`);

  watch(join(SRC_PATH, "config.json"))
    .on("change", (path: string) => {
      src(path)
        .pipe(dest(BUILD_PATH))
        .pipe(deploy(path));
    });

  console.log(`💂 Watcher on "${join(SRC_PATH, "config.json")}" have started`);

  done();
});

task("build", async (done) => {
  await del("build");

  WATCHED_TS_TYPES
    .forEach(x => transformTS(x)
      .pipe(header("\ufeff"))
      .pipe(dest(BUILD_PATH))
    );

  transformTS(join(SRC_PATH, "api.ts"))
    .pipe(change((content) => `<%\n${content}\n%>\n`))
    .pipe(rename({
      extname: ".html"
    }))
    .pipe(header("\ufeff"))
    .pipe(dest(BUILD_PATH));


  src(join(SRC_PATH, "index.xml"), { base: SRC_PATH })
    .pipe(header("\ufeff"))
    .pipe(dest(BUILD_PATH));

  transformTS(join(SRC_PATH, "index.ts"))
    .pipe(rename({
      extname: ".bs"
    }))
    .pipe(header("\ufeff"))
    .pipe(dest(BUILD_PATH));

  src(join(SRC_PATH, "config.json"))
    .pipe(dest(BUILD_PATH))

  done();
});
