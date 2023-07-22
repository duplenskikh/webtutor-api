import { dest, src, task, watch } from "gulp";

import { createProject } from "gulp-typescript";
import rename from "gulp-rename";
import change from "gulp-change";
import header from "gulp-header";
import zip from "gulp-zip";
const stripImportExport = require("gulp-strip-import-export");

import del from "del";

import * as consts from "./gulp/consts";
import { deploy } from "./gulp/plugins";
import { readdirSync, statSync } from "fs";
import { join } from "path";

const baseSrc = (path) => src(path, { base: consts.SRC_PATH });
const removeImportsExports = (content: string) => content.replace(consts.IMPORT_REGEXP, "// $1").replace(consts.EXPORT_REGEXP, "// $1");

const transformTS = (path: string) => {
  return baseSrc(path)
    .pipe(change(removeImportsExports))
    .pipe(createProject(consts.TS_CONFIG_PATH)())
    .on("error", (error) => console.log(`Transpilation error: ${error}`))
    .pipe(stripImportExport())
    .on("end", () => console.log(`🔧 File "${path}" transpiled successfully`))
};

task("dev", (done) => {
  consts.WATCHED_TS_TYPES
    .forEach(x => {
      watch(x).on("change", (path: string) => {
        transformTS(path)
          .pipe(header("\ufeff"))
          .pipe(dest(consts.BUILD_PATH))
          .pipe(deploy(path))
      });

      console.log(`💂 Watcher on "${x}" have started`);
    });

  watch(consts.API_TS)
    .on("change", (path) => {
      transformTS(path)
        .pipe(change((content) => `<%\n${content}\n%>\n`))
        .pipe(rename({
          extname: ".html"
        }))
        .pipe(header("\ufeff"))
        .pipe(dest(consts.BUILD_PATH))
        .pipe(deploy(path))
    });

  console.log(`💂 Watcher on "${consts.API_TS}" have started`);

  watch(consts.INDEX_XML)
    .on("change", (path: string) => {
      baseSrc(path)
        .pipe(header("\ufeff"))
        .pipe(dest(consts.BUILD_PATH));
    });

  console.log(`💂 Watcher on "${consts.INDEX_XML}" have started`);

  watch(consts.INDEX_TS)
    .on("change", (path: string) => {
      transformTS(path)
        .pipe(rename({
          extname: ".bs"
        }))
        .pipe(header("\ufeff"))
        .pipe(dest(consts.BUILD_PATH))
        .pipe(deploy(path));
    });

  console.log(`💂 Watcher on "${consts.INDEX_TS}" have started`);

  watch(consts.CONFIG_JSON)
    .on("change", (path: string) => {
      src(path)
        .pipe(dest(consts.BUILD_PATH))
        .pipe(deploy(path));
    });

  console.log(`💂 Watcher on "${consts.CONFIG_JSON}" have started`);

  done();
});

task("build", async (done) => {
  await del("build");

  consts.WATCHED_TS_TYPES
    .forEach(x => transformTS(x)
      .pipe(header("\ufeff"))
      .pipe(dest(consts.BUILD_PATH))
    );

  transformTS(consts.API_TS)
    .pipe(change((content) => `<%\n${content}\n%>\n`))
    .pipe(rename({
      extname: ".html"
    }))
    .pipe(header("\ufeff"))
    .pipe(dest(consts.BUILD_PATH));


  baseSrc(consts.INDEX_XML)
    .pipe(header("\ufeff"))
    .pipe(dest(consts.BUILD_PATH));

  transformTS(consts.INDEX_TS)
    .pipe(rename({
      extname: ".bs"
    }))
    .pipe(header("\ufeff"))
    .pipe(dest(consts.BUILD_PATH));

  baseSrc(consts.CONFIG_JSON)
    .pipe(dest(consts.BUILD_PATH));

  baseSrc([consts.INSTALL_SH, consts.INSTALL_PS1])
    .pipe(dest(consts.BUILD_PATH));
  
  done();
});

task("zip", async (done) => {
  src(consts.BUILD_PATH)
    .pipe(zip(`build_${new Date().toLocaleDateString("ru-RU")}_${new Date().toLocaleTimeString("ru-RU")}.zip`))
    .pipe(dest(consts.PACKAGES_PATH));

  done();
});

task("deliver", async (done) => {
  const files = readdirSync(consts.PACKAGES_PATH);

  if (files.length === 0) {
    done();
    return;
  }

  files.sort((f, s) => statSync(join(consts.PACKAGES_PATH, f)).ctime > statSync(join(consts.PACKAGES_PATH, s)).ctime ? -1 : 1);

  console.log(files[0]);

  done();
});
