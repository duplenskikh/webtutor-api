import { Route } from "..";
import { dapi } from "../dapi";

export function functions(): Route[] {
  return [{
    method: "GET",
    pattern: "/event",
    callback: "getEvent",
    access: "user",
    params: {
      id: {
        type: "number",
        store: "query",
        description: "Id мероприятия"
      }
    }
  }, {
    method: "GET",
    pattern: "/events",
    callback: "getEvents",
    access: "user",
    params: {
      page: {
        type: "number",
        val: 1
      },
      per_page: {
        type: "number",
        val: 100
      }
    }
  }];
}

export function getEvent(params: Object) {
  try {
    const result = dapi.services.events.getDetails(params.id);
    return dapi.utils.response.ok(result);
  } catch (error) {
    return error.message == "Не удалось открыть документ мероприятия"
      ? dapi.utils.response.notFound(error.message)
      : dapi.utils.response.abort(error.message);
  }
}

export function getEvents(_params: Object, req: Request) {
  return dapi.utils.response.ok(dapi.utils.paginator.gather(dapi.services.events.getEvents(), req.Query));
}
