import { wshcmx } from "./index";

export function handle(req: Request, res: Response) {
  const route = wshcmx.utils.router.getRoute(req.UrlPath, req.Method);

  if (wshcmx.utils.type.isUndef(route)) {
    wshcmx.utils.response.notFound(res, `В библиотеке отсутствует обработчик по url ${req.UrlPath} для метод ${req.Method}]`);
    return;
  }

  const isAnonymous = route.access == "anonymous" || route.access == "dev";

  if (!isAnonymous) {
    const auth = wshcmx.utils.passport.authenticate(req);

    if (auth === null) {
      req.Session.SetProperty("url_prev_auth", wshcmx.utils.request.getHeader(req.Header, "referer"));
      wshcmx.utils.response.unauthorized(res);
      return;
    }

    if (auth.type != route.access && route.access != "both") {
      wshcmx.utils.response.forbidden(res);
      return;
    }
  }

  const handler = OpenCodeLib(route.GetOptProperty("url"));

  let params;

  try {
    if (!wshcmx.utils.type.isUndef(route.params)) {
      params = wshcmx.utils.validator.parse(req, route.params);
    }
  } catch (error) {
    wshcmx.utils.response.unprocessableContent(res, error);
    return;
  }

  CallObjectMethod(handler, route.callback, [req, res, params]);
}

Request.AddRespHeader("X-wshcmx", "true");

try {
  handle(Request, Response);
} catch (error) {
  wshcmx.utils.response.abort(Response, error);
}
