import { utils, services, Route, Config, RouteParameter } from "./index";

interface DAPI {
  availableParametersTypes: RouteParameter["type"][];
  config: Config;
  basepath: string | null;
  init(): void;
  maxFileSize: number;
  routes: Route[];
  services: typeof services;
  supportedFilesExts: string[];
  utils: typeof utils;
}

export let dapi: DAPI;
