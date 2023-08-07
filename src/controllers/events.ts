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
        val: 1,
        optional: true
      },
      per_page: {
        type: "number",
        val: 100,
        optional: true
      }
    }
  }];
}

export function getEvent(req: Request, res: Response, params: Object) {
  const eventDocument = tools.open_doc<EventDocument>(params.id);

  if (eventDocument === undefined) {
    return dapi.utils.response.notFound(res, "Мероприятие не найдено");
  }

  return dapi.utils.response.ok(res, dapi.services.events.getDetails(params.id));
}

export function getEvents(req: Request, res: Response) {
  return dapi.utils.response.ok(res, dapi.utils.paginator.gather(dapi.services.events.getEvents(), req.Query));
}
