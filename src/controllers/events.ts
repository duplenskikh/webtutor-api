import { HandlerParams, Route } from "..";
import { dapi } from "../dapi";

export function functions(): Route[] {
  return [{
    method: "GET",
    pattern: "/event",
    callback: "getEvent",
    access: "user"
  }, {
    method: "GET",
    pattern: "/events",
    callback: "getEvents",
    access: "user"
  }];
}

export function getEvent() {
  return dapi.utils.response.ok(`curUserID is ${Request.Session.Env.curUserID}`);
}

export function getEvents(_params: Object, req: Request) {
  return dapi.utils.response.ok(dapi.utils.paginator.gather(dapi.services.events.getEvents(), req.Query));
}
