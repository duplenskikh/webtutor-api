import { dapi } from "./index";

export function handle(req: Request, res: Response) {
  const route = dapi.utils.router.getRoute(req.UrlPath, req.Method);

  if (dapi.utils.type.isUndef(route)) {
    dapi.utils.response.notFound(res, `В библиотеке отсутствует обработчик по url ${req.UrlPath} для метод ${req.Method}]`);
    return;
  }

  const isAnonymous = route.access == "anonymous" || route.access == "dev";

  if (!isAnonymous) {
    const auth = dapi.utils.passport.authenticate(req);

    if (auth === null) {
      req.Session.SetProperty("url_prev_auth", dapi.utils.request.getHeader(req.Header, "referer"));
      dapi.utils.response.unauthorized(res);
      return;
    }

    if (auth.type != route.access && route.access != "both") {
      dapi.utils.response.forbidden(res);
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
    dapi.utils.response.unprocessableContent(res, error);
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
