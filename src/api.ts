import { dapi } from "./dapi";

export function handle(req: Request, res: Response) {
  const route = dapi.utils.router.getRoute(req.UrlPath, req.Method);

  if (dapi.utils.type.isUndef(route)) {
    dapi.utils.response.abort(res, `В библиотеке отсутствует обработчик по url ${req.UrlPath} для метод ${req.Method}]`, 404);
    return;
  }

  const isAnonymous = route.access == "anonymous" || route.access == "dev";

  if (!isAnonymous) {
    const auth = dapi.utils.passport.authenticate(req);

    if (auth === null) {
      req.Session.SetProperty("url_prev_auth", dapi.utils.request.getHeader(req.Header, "referer"));
      dapi.utils.response.abort(res, "Необходима авторизация", 401);
      return;
    }

    if (auth.type != route.access && route.access != "both") {
      dapi.utils.response.abort(res, "Доступ запрещён", 403);
      return;
    }
  }

  const handler = OpenCodeLib(route.GetOptProperty("url"));

  let params;

  try {
    if (!dapi.utils.type.isUndef(route.params)) {
      params = dapi.utils.validator.parse(req, route.params);
    }
  } catch (error) {
    dapi.utils.response.abort(res, error, 422);
    return;
  }

  CallObjectMethod(handler, route.callback, [req, res, params]);
}

Request.AddRespHeader("X-DAPI", "true");

try {
  handle(Request, Response);
} catch (error) {
  dapi.utils.response.abort(Response, error);
}
