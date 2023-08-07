import yargs from "yargs";
import { hideBin } from "yargs/helpers";

yargs(hideBin(process.argv));

import { dest, series, src, task } from "gulp";
import chalk from "chalk";
import watch from "gulp-watch";

import format from "date-format";

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
import { join, parse } from "path";

import { version } from "./package.json";
import { generateOAPI } from "@misc/openapi/openapi";
import { dirtyCheckCoverage } from "@misc/e2e";

const baseSrc = (path) => src(path, { base: consts.SRC_PATH });
const removeImportsExports = (content: string) =>
  content.replace(consts.IMPORT_REGEXP, "// $1").replace(consts.EXPORT_REGEXP, "// $1");

const transformTS = (path: string) => {
  return baseSrc(path)
    .pipe(change(removeImportsExports))
    .pipe(createProject(consts.TS_CONFIG_PATH)())
    .on("error", (error) => console.log(`Transpilation error: ${error}`))
    .pipe(stripImportExport())
    .on("end", () => console.log(chalk.green(`🔧 Файл ${path} успешно транспилирован`)));
};

task("dev", (done) => {
  consts.WATCHED_TS_TYPES
    .forEach(x => {
      watch(x).on("change", (path: string) => {
        transformTS(path)
          .pipe(header("\ufeff"))
          .pipe(dest(consts.BUILD_PATH))
          .pipe(deploy(path, consts.DEPLOY_URL));
      });

      console.log(`💂 Watcher on "${x}" have started`);
    });

  watch(consts.API_TS)
    .on("change", (path) => {
      transformTS(path)
        .pipe(change((content) => `<%\n${content}\n%>\n`))
        .pipe(rename({ extname: ".html" }))
        .pipe(header("\ufeff"))
        .pipe(dest(consts.BUILD_PATH))
        .pipe(deploy(path, consts.DEPLOY_URL));
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
        .pipe(rename({ extname: ".bs" }))
        .pipe(header("\ufeff"))
        .pipe(dest(consts.BUILD_PATH))
        .pipe(deploy(path, consts.DEPLOY_URL));
    });

  console.log(`💂 Watcher on "${consts.INDEX_TS}" have started`);

  watch(consts.CONFIG_JSON)
    .on("change", (path: string) => {
      src(path)
        .pipe(dest(consts.BUILD_PATH))
        .pipe(deploy(path, consts.DEPLOY_URL));
    });

  console.log(`💂 Watcher on "${consts.CONFIG_JSON}" have started`);

  done();
});

task("build:sources", async(done) => {
  consts.WATCHED_TS_TYPES
    .forEach(x => transformTS(x)
      .pipe(header("\ufeff"))
      .pipe(dest(consts.BUILD_PATH))
    );

  transformTS(consts.API_TS)
    .pipe(change((content) => `<%\n${content}\n%>\n`))
    .pipe(rename({ extname: ".html" }))
    .pipe(header("\ufeff"))
    .pipe(dest(consts.BUILD_PATH));


  baseSrc(consts.INDEX_XML)
    .pipe(header("\ufeff"))
    .pipe(dest(consts.BUILD_PATH));

  transformTS(consts.INDEX_TS)
    .pipe(rename({ extname: ".bs" }))
    .pipe(header("\ufeff"))
    .pipe(dest(consts.BUILD_PATH));

  baseSrc(consts.CONFIG_JSON)
    .pipe(change((content) => JSON.stringify({
      ...JSON.parse(content),
      version,
      env: process.argv.indexOf("--production") !== -1 ? "production" : "development"
    }, null, 2)))
    .pipe(dest(consts.BUILD_PATH));

  baseSrc([consts.INSTALL_SH, consts.INSTALL_PS1])
    .pipe(dest(consts.BUILD_PATH));

  src(consts.OPENAPI_HTML)
    .pipe(dest(consts.OPENAPI_BUILD_PATH));

  console.log(chalk.greenBright("Собраны все исходные файлы"));

  done();
});

task("zip", async(done) => {
  console.log(chalk.bgYellowBright("Задача по упаковке приложения в zip архив"));

  const outputZipPath = `build_${format.asString("yyyy_MM_dd_hh_mm_ss", new Date())}.zip`;

  src(join(consts.BUILD_PATH, "**/*"))
    .pipe(zip(outputZipPath))
    .pipe(dest(consts.PACKAGES_PATH));

  console.log(chalk.bgGreen(`Архив ${outputZipPath} создан в директории ${consts.PACKAGES_PATH}`));

  done();
});

task("delivery", async(done) => {
  console.log(chalk.bgYellowBright("Запущена задача поставки приложения на удаленный сервер"));

  const files = readdirSync(consts.PACKAGES_PATH);

  if (files.length === 0) {
    console.log(chalk.white.bgRed("Не найдено файлов для поставки"));
    done();
    return;
  }

  const filesPath = files.filter(x => parse(x).ext === ".zip").map(x => join(consts.PACKAGES_PATH, x));
  filesPath.sort((f, s) => statSync(f).ctime > statSync(s).ctime ? -1 : 1);
  console.log(chalk.bgGreen(`Найден файл ${filesPath[0]} для поставки`));

  src(filesPath[0]).pipe(deploy(filesPath[0], consts.BUILD_URL));

  done();
});

task("openapi:generate", () => {
  console.log(chalk.blue("Запущена задача openapi:generate по генерации документации openapi"));
  src(consts.OPENAPI_HTML).pipe(dest(consts.OPENAPI_BUILD_PATH));
  return generateOAPI();
});

task("openapi:delivery", (done) => {
  src(consts.BUILD_OPENAPI_JSON_PATH, { base: consts.BUILD_PATH }).pipe(deploy(consts.OPENAPI_JSON, consts.DEPLOY_URL));
  src(consts.BUILD_OPENAPI_HTML_PATH, { base: consts.BUILD_PATH }).pipe(deploy(consts.OPENAPI_HTML, consts.DEPLOY_URL));
  done();
});

task("e2e:check:dirty", (done) => {
  dirtyCheckCoverage();
  done();
});

task("del", async(done) => {
  // await del("build");
  done();
});

task("build", series(
  "del",
  "build:sources",
  "openapi:generate"
));
