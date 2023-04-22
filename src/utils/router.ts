import { Route } from "..";
import { dapi } from "../dapi";

export function getRoute(pattern: string, r: Response) {
  pattern = StrReplaceOne(pattern, dapi.config.api.pattern, "");
  let i = 0;

  for (i = 0; i < dapi.routes.length; i++) {
    if (dapi.routes[i].pattern == pattern) {
      return dapi.routes[i];
    }
  }
}

export function init() {
  DropFormsCache("./../api/*");
  const apis = ReadDirectory("./../api");
  let i = 0;
  let j = 0;
  let apiFunctions;
  const routes: Route[] = [];
  let obj;

  for (i = 0; i < apis.length; i++) {
    apiFunctions = OpenCodeLib(apis[i]).functions() as Route[];

    for (j = 0; j < apiFunctions.length; j++) {
      obj = apiFunctions[j];
      routes.push({
        method: obj.method,
        pattern: obj.pattern,
        callback: obj.callback,
        access: obj.access,
        url: apis[i],
        params: obj.HasProperty("params") ? obj.params : {}
      });
    }
  }

  dapi.routes = routes;
}
