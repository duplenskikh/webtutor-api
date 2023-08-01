import { config } from "dotenv";
config();

import { defineConfig } from "cypress";

const { DEPLOYER_HOST } = process.env;
import { pattern } from "@src/config.json";

export default defineConfig({
  e2e: {
    baseUrl: (new URL(pattern, DEPLOYER_HOST)).toString(),
    retries: {
      runMode: 2
    }
  },
  env: {
    user_login: "user1",
    user_password: "user1"
  },
  video: false,
});
