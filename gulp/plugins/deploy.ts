const PLUGIN_NAME = "gulp-deploy";

import https from "https";
import axios from "axios";
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

const httpsAgent = new https.Agent({
  rejectUnauthorized: false,
});

const normalizePath = (path: string) => sep === "\\" ? path.split(sep).join(posix.sep) : path;

export const deploy = (file: string, url) => {
  return obj((chunk, _, cb) => {
    if (!chunk.isBuffer()) {
      throw new pluginError(PLUGIN_NAME, "Only buffer accepted");
    }

    const requestUrl = `${DEPLOYER_HOST}${APIConfigJSON.pattern}/${url}`;
    const chunkRelative = normalizePath(chunk.relative);

    console.log(chalk.bgYellowBright(`Отправляем файл ${chunkRelative} по адресу ${requestUrl}`));

    axios.post(`${requestUrl}?file=${chunkRelative}`, chunk.contents, {
      httpsAgent,
      headers: {
        "x-app-id": DEPLOYER_APP_ID,
        Authorization: authorizationHeader,
      }
    })
      .then(({ data }) => {
        console.log(chalk.green(`${new Date().toLocaleString("ru-RU")}. Файл ${basename(file)} был успешно сохранен по пути ${data.data}`));
      })
      .catch(({ response }) => {
        console.log(chalk.bgRed("Произошла ошибка при деплое файла"));
        console.log(chalk.red(`Статус запроса ${response.status}`));

        if (response.data?.message) {
          console.log(`Сообщение об ошибке: ${response.data.message}`);
        }
      });

    cb(null, chunk);
  });
};
