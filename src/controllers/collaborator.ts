import { Route } from "..";
import { dapi } from "../dapi";

export function functions(): Route[] {
  return [{
    method: "GET",
    pattern: "/collaborator/current",
    callback: "getCollaborator",
    access: "user",
    params: {
      user_id: {
        type: "number",
        optional: false,
        convert: true
      }
    }
  }, {
    method: "GET",
    pattern: "/collaborators",
    callback: "getCollaborators",
    access: "user"
  }];
}

export function getCurrentUser(params: Object, req: Request) {
  return dapi.utils.response.ok([req.Session.Env.curUser, "hello from delivery2"]);
}

export function getCollaborators() {
  const query = ArraySelectAll(tools.xquery("for $e in collaborators return $e"));
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
