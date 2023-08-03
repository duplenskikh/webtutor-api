import { mkdirSync, readFileSync, writeFileSync } from "fs";
import { join } from "path";
import chalk from "chalk";

import { config } from "dotenv";
import { Controllers, findControllers } from "../utils";
config();

const PROJECT_PATH = join(__dirname, "..", "..");
const TEMPLATE_OBJECT = JSON.parse(readFileSync(join(__dirname, "/openapi.template.json"), "utf-8"));
const CONFIG_OBJECT = JSON.parse(readFileSync(join(PROJECT_PATH, "src", "config.json"), "utf-8"));
const PACKAGE_OBJECT = JSON.parse(readFileSync(join(PROJECT_PATH, "package.json"), "utf-8"));
const BUILD_OPENAPI_PATH = join(PROJECT_PATH, "build", "openapi");

mkdirSync(BUILD_OPENAPI_PATH, { recursive: true });

function fillPaths(controllers: Controllers[]) {
  for (const controller of controllers) {
    for (const fn of controller.functions) {
      TEMPLATE_OBJECT.paths[fn.pattern] = TEMPLATE_OBJECT.paths[fn.pattern] || {};
      const pattern = TEMPLATE_OBJECT.paths[fn.pattern];
      const method = fn.method.toLowerCase();
      pattern[method] = pattern[method] || {};
      pattern[method].summary = fn.summary || "Без описания";
      pattern[method].operationId = fn.callback;
      pattern[method].tags = pattern[method].tags || [];
      pattern[method].tags.push(controller.name);
      pattern[method].security = pattern[method].security || [];
      pattern[method].parameters = pattern[method].parameters || [];

      if (fn.access === "user" || fn.access === "both") {
        pattern[method].security.push({ cookieAuth: [] });
      }

      if (fn.access === "application" || fn.access === "both") {
        pattern[method].security.push({ basicAuth: [] });
        pattern[method].parameters.push({
          "in": "header",
          "name": "X-App-Id",
          "schema": {
            "type": "string"
          },
          "required": fn.access === "application",
          "description": "Название приложения для авторизации"
        });
      }

      pattern[method].responses = {
        200: {
          description: "OK",
          content: {}
        },
        500: { $ref: "#/components/responses/ServerError" },
        503: { $ref: "#/components/responses/ServiceUnavailable" }
      };

      if (typeof fn.params === "object" && Object.keys(fn.params).length !== 0) {
        const bodyParameters = Object.keys(fn.params).filter(x => fn.params[x].store === "body");

        const queryParameters = Object.keys(fn.params)
          .filter(x => fn.params[x].store === "query" || typeof fn.params[x].store === "undefined");

        if (bodyParameters.length !== 0) {
          const requiredBodyParameters = bodyParameters.filter(x => !fn.params[x].optional);

          pattern[method].requestBody = {
            required: requiredBodyParameters.length !== 0,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {},
                  required: requiredBodyParameters
                }
              }
            }
          };

          for (const key of bodyParameters) {
            pattern[method].requestBody.content["application/json"].schema.properties[key] = {
              type: fn.params[key].type == "date" ? "string" : fn.params[key].type,
              format: fn.params[key].type == "date" ? "date" : undefined,
              items: fn.params[key].type == "array" ? { type: fn.params[key].items ?? "string" } : undefined
            };
          }
        }

        for (let key of queryParameters) {
          pattern[method].parameters.push({
            in: "query",
            name: key,
            schema: {
              type: fn.params[key].type,
              default: fn.params[key].val,
              format: fn.params[key].format,
              maximum: fn.params[key].max,
              minimum: fn.params[key].min,
              example: fn.params[key].example
            },
            required: !fn.params[key].optional,
            description: fn.params[key].description,
            allowReserved: fn.params[key].type === "string"
          });
        }

        pattern[method].responses[403] = { $ref: "#/components/responses/BadRequest" };
        pattern[method].responses[404] = { $ref: "#/components/responses/NotFound" };
      }

      if (fn.access !== "anonymous") {
        pattern[method].responses[401] = { $ref: "#/components/responses/UnauthorizedError" };
      }
    }
  }

  writeFileSync(join(BUILD_OPENAPI_PATH, "openapi.json"), JSON.stringify(TEMPLATE_OBJECT, null, 2));
  console.log(chalk.blue("📄 openapi.json сформирован"));
}

export async function generateOAPI() {
  console.log(chalk.blue("🔨 Собираем openapi документацию к проекту"));
  const controllers = await findControllers();
  console.log(chalk.blue(`🔎 Найдено:\n\t${controllers.length} контроллеров\n\t${controllers.map(x => x.functions).flat().length} обработчиков`));
  TEMPLATE_OBJECT.info.version = PACKAGE_OBJECT.version;
  TEMPLATE_OBJECT.servers[0].url = new URL(CONFIG_OBJECT.pattern, process.env.DEPLOYER_HOST || "http://localhost:80");
  fillPaths(controllers);
}
