import { readFileSync, readdirSync, writeFileSync } from "fs";
import { join, parse } from "path";
import chalk from "chalk";

import { Route } from "../src";

import { config } from "dotenv";
config();

const oapiTemplate = JSON.parse(readFileSync(join(__dirname, "/oapi.template.json"), "utf-8"));
const apiConfig = JSON.parse(readFileSync(join(__dirname, "..", "src", "config.json"), "utf-8"));
const packageJSON = JSON.parse(readFileSync(join(__dirname, "..", "package.json"), "utf-8"));
const controllersPath = join(__dirname, "..", "src", "controllers");
const controllersFiles = readdirSync(controllersPath);

async function findControllers() {
  const functions = [];

  for (const controllersFile of controllersFiles) {
    const parsedPath = parse(controllersFile);
    const controllerPath = join(controllersPath, parsedPath.name);
    const controller = await import(controllerPath);

    if (typeof controller.functions === "function") {
      functions.push(...controller.functions());
    }
  }

  return functions;
}

function fillPaths(controllers: Route[]) {
  for (const controller of controllers) {
    oapiTemplate.paths[controller.pattern] = oapiTemplate.paths[controller.pattern] || {};
    const pattern = oapiTemplate.paths[controller.pattern];
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

  writeFileSync(join(__dirname, "oapi.json"), JSON.stringify(oapiTemplate, null, 2));
  console.log(chalk.blue("📄 oapi.json сформирован"));
}

async function run() {
  const controllers = await findControllers();
  console.log(chalk.blue(`🔎 Найдено ${controllers.length} обработчиков`));
  oapiTemplate.info.version = packageJSON.version;
  oapiTemplate.servers[0].url = new URL(apiConfig.pattern, process.env.DEPLOYER_HOST);
  fillPaths(controllers);
}

console.log(chalk.blue("🔨 Собираем openapi документацию к проекту"));
run();
