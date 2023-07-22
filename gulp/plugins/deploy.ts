const PLUGIN_NAME = "gulp-deploy";

import { request } from "urllib";
import { obj } from "through2";
import pluginError from "plugin-error";

import { config } from "dotenv";
config();

import { basename } from "path";

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

    request(`${DEPLOYER_URL}?file=${chunk.relative}`, {
      method: "POST",
      content: chunk.contents,
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
