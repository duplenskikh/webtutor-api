import { dapi } from "../dapi";

function json<T>(
  res: Response,
  payload: T,
  status = 200,
  message: string = null
) {
  res.ContentType = "application/json; charset=utf-8;";

  if (status !== 200) {
    res.SetRespStatus(status, message);
  }

  res.Write((dapi.utils.type.isPrimitive(payload) ? payload : tools.object_to_text(payload, "json")) as string);
}

export function ok<T>(res: Response, data: T, status = 200) {
  json(
    res,
    data,
    status
  );
}

export function notModified(res: Response) {
  ok(res, null, 304);
}

export function abort(res: Response, message: Error | string, status: number = 500) {
  message = (
    dapi.utils.type.isError(message) && dapi.config.env != "development"
      ? message.message
      : RValue(message)
  ) as string;

  json(
    res,
    { error: message },
    status,
    message
  );
}

export function forbidden(res: Response, message: string) {
  abort(res, message, 403);
}

export function notFound(res: Response, message: string) {
  abort(res, message, 404);
}

export function methodNotAllowed(res: Response, message: string = "Метод не разрешен") {
  abort(res, message, 405);
}

export function binary(res: Response, file: ResourceDocument) {
  const binary = new Binary();
  const url = tools.file_source_get_file_to_save_url(
    file.TopElem.file_source.Value,
    file.DocID,
    file.TopElem.file_url.Value
  );
  binary.LoadFromUrl(url);
  res.ContentType = tools_web.url_std_content_type(url);
  res.AddHeader("Content-Disposition", `filename=${UrlEncode(file.TopElem.name.Value)}`);
}
