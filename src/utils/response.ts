import { APIResponse } from "..";
import { dapi } from "../dapi";

export function json(response: string | APIResponse<unknown>, res: Response) {
  if (dapi.utils.type.isPrimitive(response)) {
    return tools.object_to_text({ data: response }, "json");
  }

  const statusCode = response.GetOptProperty("statusCode", 200);

  if (statusCode !== 200) {
    res.SetRespStatus(statusCode, response.GetOptProperty("message"));
  }

  return tools.object_to_text({
    data: response.data,
    message: response.message
  }, "json");
}

export function ok<T>(data: T, statusCode = 200): APIResponse<T> {
  return {
    statusCode,
    data,
    message: null
  };
}

export function abort<T>(message: string, statusCode: number = 500, data: T = null): APIResponse<T> {
  return {
    statusCode,
    data,
    message: RValue(message)
  };
}

export function notFound(message: string) {
  return abort(message, 404);
}
