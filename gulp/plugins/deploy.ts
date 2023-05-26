const PLUGIN_NAME = "gulp-deploy";

import { request } from "urllib";
import { obj } from "through2";
import pluginError from "plugin-error";
import { join } from "path";

import { config } from "dotenv";
import { SRC_PATH } from "../consts";
config();

import {
  dirname,
  basename,
  posix,
  sep,
  parse
} from "path";
import { readFileSync } from "fs";

const {
  DEPLOYER_LOGIN,
  DEPLOYER_PASSWORD,
  DEPLOYER_URL,
  DEPLOYER_APP_ID
} = process.env;

const authorizationHeader = `Basic ${Buffer.from(`${DEPLOYER_LOGIN}:${DEPLOYER_PASSWORD}`).toString("base64")}`;

export const deploy = (file: string, outerCallback?: CallableFunction) => {
  return obj((chunk, _, cb) => {
    if (!chunk.isBuffer()) {
      throw new pluginError(PLUGIN_NAME, "Only buffer accepted");
    }

    const API_WEBTUTOR_BASE_PATH = JSON.parse(readFileSync("src/config.json", "utf-8")).api.cwd;

    console.log(file, join(API_WEBTUTOR_BASE_PATH, dirname(file.split(sep).join(posix.sep)).replace(SRC_PATH, "")));

    request(`${DEPLOYER_URL}?filepath=${posix.join(
      join(API_WEBTUTOR_BASE_PATH, dirname(file.split(sep).join(posix.sep)).replace(SRC_PATH, "")),
      parse(chunk.relative).base
    )}`, {
      method: "POST",
      data: chunk.contents,
      headers: {
        "x-app-id": DEPLOYER_APP_ID,
        Authorization: authorizationHeader,
      },
    })
    .then(({ statusCode, data }) => {
      if (statusCode !== 200) {
        console.log(`🛑 Error due to deploy ${file}`);

        try {
          console.log(`Error message ${JSON.parse(data).message}`);
        } catch (error) {
          console.log(`Error message ${data}`);
        }
        console.log(`Err: ${data}`);
        console.log(`Status code is ${statusCode}`);
        return;
      }

      console.log(`🌐 File "${basename(file)}" was successfully deployed on server "${JSON.parse(data).data}"`);
      console.log(`⏱️  ${new Date().toLocaleString("ru-RU")}\n`);

      if (outerCallback instanceof Function) {
        outerCallback(file, chunk);
      }
    })
    .catch((err) => {
      console.error(err);
    });

    cb(null, chunk);
  });
};
