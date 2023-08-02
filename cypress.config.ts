import { config } from "dotenv";
config();

import { defineConfig } from "cypress";

const {
  DEPLOYER_HOST,
  CYPRESS_USER_LOGIN,
  CYPRESS_USER_PASSWORD
} = process.env;
import { pattern } from "@src/config.json";

export default defineConfig({
  e2e: {
    baseUrl: (new URL(pattern, DEPLOYER_HOST)).toString(),
    retries: {
      runMode: 2
    }
  },
  env: {
    user_login: CYPRESS_USER_LOGIN || "user1",
    user_password: CYPRESS_USER_PASSWORD || "user1"
  },
  video: false
});
