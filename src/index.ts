type Utils = {
  array: typeof import("./utils/array");
  config: typeof import("./utils/config");
  log: typeof import("./utils/log");
  object: typeof import("./utils/object");
  passport: typeof import("./utils/passport");
  request: typeof import("./utils/request");
  response: typeof import("./utils/response");
  router: typeof import("./utils/router");
  type: typeof import("./utils/type");
  validator: typeof import("./utils/validator");
}

type Services = {
  events: typeof import("./services/events");
}

type HandlerParam = {
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

export type HandlerParams = {
  __strict?: boolean;
  [key: string]: HandlerParam | string | any;
}

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
  api: {
    pattern: string;
    cwd: string;
  },
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
  log: undefined,
  object: undefined,
  passport: undefined,
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
    fileName = FileName(UrlToFilePath(files[i])).split(".")[0]
    alert(`${"⚙️"} ${type} "${fileName}" is loading with hash "${Md5Hex(LoadUrlData(files[i]))}"`);
    
    container.SetProperty(
      fileName,
      OpenCodeLib(files[i])
    );

    alert(`${"🚀"} ${type} "${fileName}" was successfully loaded. Hash "${Md5Hex(LoadUrlData(files[i]))}"`);
  }
}

export function init() {
  loadInternals(utils, "./utils");
  loadInternals(services, "./services");
  utils.config.init();
  utils.router.init();
}
