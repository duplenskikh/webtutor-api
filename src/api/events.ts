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

export function getEvent(params: HandlerParams, Request: Request) {
  return dapi.utils.response.ok(`curUserID is ${Request.Session.Env.curUserID}`);
}

export function getEvents(params: HandlerParams, Request: Request) {
  return dapi.utils.response.ok(dapi.services.events.getEvents());
}
