import { Headers, utils, services, Route, Config } from "./index";

interface DAPI {
  basepath: string | null;
  Headers: typeof Headers;
  routes: Route[];
  utils: typeof utils;
  services: typeof services;
  config: Config;
  init(): void;
}

export let dapi: DAPI;
