type Utils = {
  array: typeof import("./utils/array");
  config: typeof import("./utils/config");
  fs: typeof import("./utils/fs");
  log: typeof import("./utils/log");
  object: typeof import("./utils/object");
  paginator: typeof import("./utils/paginator");
  passport: typeof import("./utils/passport");
  query: typeof import("./utils/query");
  request: typeof import("./utils/request");
  response: typeof import("./utils/response");
  router: typeof import("./utils/router");
  type: typeof import("./utils/type");
  validator: typeof import("./utils/validator");
}

type Services = {
  events: typeof import("./services/events");
}

type RouteParameters = {
  type: "string" | "number" | "date" | "array" | "boolean";
  defaultValue?: string | number | boolean | null;
  optional?: boolean;
  convert?: boolean;
  nullable?: boolean;
  min?: number;
  max?: number;
  example?: string | number | string[] | number[];
  items?: string;
  in?: "body" | "query";
  description?: string;
  real?: boolean;
}

export type HandlerParams = { __strict?: boolean } & { [key: string]: RouteParameters | string };

export type Route = {
  method: "GET" | "POST";
  pattern: string;
  callback: string;
  access: "user" | "application" | "both" | "anonymous";
  params?: HandlerParams;
}

export type Config = {
  env: "production" | "development";
  version: string;
  pattern: string;
  stderr: boolean;
}

export type APIResponse<T> = {
  statusCode: number;
  data: T;
  message: null | string;
}

"META:NAMESPACE:dapi";

export const Headers = {
  Ok: 200,
  NotFound: 404
};

export const routes: Route[] = [];
export const config: Config = {} as Config;

export const utils: Utils = {
  array: undefined,
  config: undefined,
  fs: undefined,
  log: undefined,
  object: undefined,
  paginator: undefined,
  passport: undefined,
  query: undefined,
  request: undefined,
  response: undefined,
  router: undefined,
  type: undefined,
  validator: undefined
};

export const services: Services = {
  events: undefined
};

function loadInternals(container: Utils | Services, url: string) {
  const type = FileName(url);
  const files = ReadDirectory(url);
  let fileName;

  for (let i = 0; i < files.length; i++) {
    fileName = FileName(UrlToFilePath(files[i])).split(".")[0];

    container.SetProperty(
      fileName,
      OpenCodeLib(files[i])
    );

    alert(`${fileName} was successfully loaded as part of ${type}, hash is ${Md5Hex(LoadUrlData(files[i]))}`);
  }
}

export function init() {
  loadInternals(utils, "./utils");
  loadInternals(services, "./services");
  utils.config.init();
  utils.router.init();
  alert(`API is ready: ${config.pattern}`);
}
