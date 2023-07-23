import { Headers, utils, services, Route, Config } from "./index";

interface DAPI {
  basepath: string;
  Headers: typeof Headers;
  routes: Route[];
  utils: typeof utils;
  services: typeof services;
  config: Config;
  init(): void;
}

export const dapi: DAPI;
