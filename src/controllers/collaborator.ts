import { Route } from "..";
import { dapi } from "../dapi";

export function functions(): Route[] {
  return [{
    method: "GET",
    pattern: "/collaborator/current",
    callback: "getCurrentUser",
    access: "user"
  }, {
    method: "GET",
    pattern: "/collaborators",
    callback: "getCollaborators",
    access: "user"
  }];
}

export function getCurrentUser(_params: Object, req: Request) {
  return dapi.utils.response.ok(req.Session.Env.curUser);
}

export function getCollaborators(params: Object) {
  return dapi.utils.response.ok(
    dapi.utils.paginator.gather(
      dapi.utils.query.extract("for $e in collaborators return $e"),
      params
    )
  );
}
