import { Route } from "..";
import { dapi } from "../dapi";

export function functions(): Route[] {
  return [{
    method: "GET",
    pattern: "/ping",
    callback: "pong",
    access: "anonymous",
    summary: "Проверка API"
  }, {
    method: "GET",
    pattern: "/nerd/routes",
    callback: "getRoutes",
    access: "dev",
    summary: "Получение списка всех роутов приложения"
  }, {
    method: "GET",
    pattern: "/nerd/check/app/auth",
    callback: "checkAppAuth",
    access: "application",
    summary: "Проверка авторизации приложения"
  }];
}

export function pong() {
  return dapi.utils.response.ok("pong");
}

export function getRoutes() {
  return dapi.utils.response.ok(dapi.routes);
}

export function checkAppAuth(_params: Object, req: Request) {
  const xAppId = dapi.utils.request.getHeader(req.Header, "x-app-id");
  return dapi.utils.response.ok(dapi.utils.passport.authenticateApplication(req, xAppId));
}
