import { readdirSync } from "fs";
import { join, parse } from "path";

import { Route } from "../src";

const PROJECT_PATH = join(__dirname, "..");
const CONTROLLERS_PATH = join(PROJECT_PATH, "src", "controllers");
const CONTROLLERS_FILES = readdirSync(CONTROLLERS_PATH);

export async function findControllers() {
  const controllers: Controllers[] = [];

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

export type Controllers = {
  name: string;
  functions: Route[];
}
