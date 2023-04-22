import { Headers, utils, Route, Config } from "./index";

interface DAPI {
  Headers: typeof Headers;
  routes: Route[];
  utils: typeof utils;
  config: Config;
  init(): void;
}

export const dapi: DAPI;
