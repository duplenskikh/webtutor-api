import { readFileSync, readdirSync, writeFileSync } from "fs";
import { join, parse } from "path";
import chalk from "chalk";

import { Route } from "../../src";

import { config } from "dotenv";
config();

const PROJECT_PATH = join(__dirname, "..", "..");
const TEMPLATE_OBJECT = JSON.parse(readFileSync(join(__dirname, "/openapi.template.json"), "utf-8"));
const CONFIG_OBJECT = JSON.parse(readFileSync(join(PROJECT_PATH, "src", "config.json"), "utf-8"));
const PACKAGE_OBJECT = JSON.parse(readFileSync(join(PROJECT_PATH, "package.json"), "utf-8"));
const CONTROLLERS_PATH = join(PROJECT_PATH, "src", "controllers");
const BUILD_OPENAPI_PATH = join(PROJECT_PATH, "build", "openapi");
const CONTROLLERS_FILES = readdirSync(CONTROLLERS_PATH);

async function findControllers() {
  const functions = [];

  for (const controllersFile of CONTROLLERS_FILES) {
    const parsedPath = parse(controllersFile);
    const controllerPath = join(CONTROLLERS_PATH, parsedPath.name);
    const controller = await import(controllerPath);

    if (typeof controller.functions === "function") {
      functions.push(...controller.functions());
    }
  }

  return functions;
}

function fillPaths(controllers: Route[]) {
  for (const controller of controllers) {
    TEMPLATE_OBJECT.paths[controller.pattern] = TEMPLATE_OBJECT.paths[controller.pattern] || {};
    const pattern = TEMPLATE_OBJECT.paths[controller.pattern];
    const method = controller.method.toLowerCase();
    pattern[method] = pattern[method] || {};
    pattern[method].summary = controller.summary || "No summary";
    pattern[method].operationId = controller.callback;
    pattern[method].responses = {
      200: {
        description: "OK",
        content: {}
      },
      401: { $ref: "#/components/responses/UnauthorizedError" },
      403: { $ref: "#/components/responses/BadRequest" },
      404: { $ref: "#/components/responses/NotFound" },
      500: { $ref: "#/components/responses/ServerError" },
      503: { $ref: "#/components/responses/ServiceUnavailable" }
    };
  }

  writeFileSync(join(BUILD_OPENAPI_PATH, "openapi.json"), JSON.stringify(TEMPLATE_OBJECT, null, 2));
  console.log(chalk.blue("📄 openapi.json сформирован"));
}

async function run() {
  const controllers = await findControllers();
  console.log(chalk.blue(`🔎 Найдено ${controllers.length} обработчиков`));
  TEMPLATE_OBJECT.info.version = PACKAGE_OBJECT.version;
  TEMPLATE_OBJECT.servers[0].url = new URL(CONFIG_OBJECT.pattern, process.env.DEPLOYER_HOST);
  fillPaths(controllers);
}

console.log(chalk.blue("🔨 Собираем openapi документацию к проекту"));
run();
