import { HandlerParams, Route } from "..";
import { dapi } from "../dapi";

export function functions(): Route[] {
  return [{
    method: "GET",
    pattern: "/collaborator",
    callback: "getCollaborator",
    access: "user"
  }, {
    method: "GET",
    pattern: "/collaborators",
    callback: "getCollaborators",
    access: "user"
  }];
}

export function getCollaborator(params: HandlerParams, Request: Request) {
  return dapi.utils.response.ok(`curUserID is ${Request.Session.Env.curUserID}`);
}

export function getCollaborators(params: HandlerParams, Request: Request) {
  const query = ArraySelectAll(tools.xquery(`for $e in collaborators return $e`));
  const result = [];

  for (let i = 0; i < query.length; i++) {
    result.push({
      id: query[i].id.Value,
      fullname: query[i].fullname.Value,
      sex: query[i].sex.Value
    });
  }

  return dapi.utils.response.ok(result);
}
