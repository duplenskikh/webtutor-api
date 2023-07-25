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
  const controllers = [];

  for (const controllersFile of CONTROLLERS_FILES) {
    const parsedPath = parse(controllersFile);
    const controllerPath = join(CONTROLLERS_PATH, parsedPath.name);
    const controller = await import(controllerPath);

    if (typeof controller.functions === "function") {
      controllers.push({
        name: parsedPath.name,
        functions: controller.functions().filter(x => x.access !== "dev")
      });
    }
  }

  return controllers;
}

type Controllers = {
  name: string;
  functions: Route[];
}

function fillPaths(controllers: Controllers[]) {
  for (const controller of controllers) {
    for (const fn of controller.functions) {
      TEMPLATE_OBJECT.paths[fn.pattern] = TEMPLATE_OBJECT.paths[fn.pattern] || {};
      const pattern = TEMPLATE_OBJECT.paths[fn.pattern];
      const method = fn.method.toLowerCase();
      pattern[method] = pattern[method] || {};
      pattern[method].summary = fn.summary || "No summary";
      pattern[method].operationId = fn.callback;
      pattern[method].tags = pattern[method].tags || [];
      pattern[method].tags.push(controller.name);
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
  }

  writeFileSync(join(BUILD_OPENAPI_PATH, "openapi.json"), JSON.stringify(TEMPLATE_OBJECT, null, 2));
  console.log(chalk.blue("📄 openapi.json сформирован"));
}

async function run() {
  const controllers = await findControllers();
  console.log(chalk.blue(`🔎 Найдено:\n\t${controllers.length} контроллеров\n\t${controllers.map(x => x.functions).flat().length} обработчиков`));
  TEMPLATE_OBJECT.info.version = PACKAGE_OBJECT.version;
  TEMPLATE_OBJECT.servers[0].url = new URL(CONFIG_OBJECT.pattern, process.env.DEPLOYER_HOST);
  fillPaths(controllers);
}

console.log(chalk.blue("🔨 Собираем openapi документацию к проекту"));
run();
