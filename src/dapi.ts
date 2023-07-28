import { utils, services, Route, Config, RouteParameter } from "./index";

interface DAPI {
  availableParametersTypes: RouteParameter["type"][];
  config: Config;
  basepath: string | null;
  init(): void;
  routes: Route[];
  services: typeof services;
  utils: typeof utils;
}

export let dapi: DAPI;
