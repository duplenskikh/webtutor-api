const PLUGIN_NAME = "gulp-deploy";

import { request } from "urllib";
import { obj } from "through2";
import pluginError from "plugin-error";

import chalk from "chalk";

import { config } from "dotenv";
config();

import { basename, posix, sep } from "path";
import { readFileSync } from "fs";
import { CONFIG_JSON } from "../consts";

const {
  DEPLOYER_LOGIN,
  DEPLOYER_PASSWORD,
  DEPLOYER_HOST,
  DEPLOYER_APP_ID
} = process.env;

const authorizationHeader = `Basic ${Buffer.from(`${DEPLOYER_LOGIN}:${DEPLOYER_PASSWORD}`).toString("base64")}`;

const APIConfigJSON = JSON.parse(readFileSync(CONFIG_JSON, "utf-8"));

const normalizePath = (path: string) => sep === "\\" ? path.split(sep).join(posix.sep) : path;

export const deploy = (file: string, url) => {
  return obj((chunk, _, cb) => {
    if (!chunk.isBuffer()) {
      throw new pluginError(PLUGIN_NAME, "Only buffer accepted");
    }

    const requestUrl = `${DEPLOYER_HOST}${APIConfigJSON.api.pattern}/${url}`;
    const chunkRelative = normalizePath(chunk.relative);

    console.log(chalk.bgYellowBright(`Отправляем файл ${chunkRelative} по адресу ${requestUrl}`));

    request(`${requestUrl}?file=${chunkRelative}`, {
      method: "POST",
      content: chunk.contents,
      headers: {
        "x-app-id": DEPLOYER_APP_ID,
        Authorization: authorizationHeader,
      },
    })
      .then(({ statusCode, data }) => {
        if (statusCode === 304) {
          console.log(chalk.bgRedBright("Файл не был изменен на удаленном сервере, так как содержит тот же контент"));
          return;
        }

        if (statusCode !== 200) {
          console.log(chalk.bgRed("Произошла ошибка при деплое файла"));
          console.log(chalk.red(`Статус запроса ${statusCode}`));
          console.log(`Сообщение об ошибке: ${data}`);
          return;
        }

        console.log(chalk.green(`${new Date().toLocaleString("ru-RU")}. Файл ${basename(file)} был успешно сохранен по пути ${JSON.parse(data).data}`));
      })
      .catch((err) => {
        console.error(err);
      });

    cb(null, chunk);
  });
};
