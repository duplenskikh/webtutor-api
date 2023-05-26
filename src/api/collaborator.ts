import { HandlerParams, Route } from "..";
import { dapi } from "../dapi";

export function functions(): Route[] {
  return [{
    method: "GET",
    pattern: "/collaborator",
    callback: "getCollaborator",
    access: "user"
  }];
}

export function getCollaborator(params: HandlerParams, Request: Request) {
  return dapi.utils.response.ok(`curUserID is ${Request.Session.Env.curUserID}`);
}
