import { Route } from "..";
import { dapi } from "index";

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

export function pong(_req: Request, res: Response) {
  return dapi.utils.response.ok(res, "pong");
}

export function getRoutes(_req: Request, res: Response) {
  return dapi.utils.response.ok(res, dapi.routes);
}

export function checkAppAuth(req: Request, res: Response) {
  const xAppId = dapi.utils.request.getHeader(req.Header, "x-app-id");
  return dapi.utils.response.ok(res, dapi.utils.passport.authenticateApplication(req, xAppId));
}
