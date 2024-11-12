import { Route } from "..";
import { dapi } from "index";

export function functions(): Route[] {
  return [{
    method: "GET",
    pattern: "/collaborator/current",
    callback: "getCurrentUser",
    access: "user",
    summary: "Получение данных по авторизованному пользователю"
  }, {
    method: "GET",
    pattern: "/collaborators",
    callback: "getCollaborators",
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

export function getCurrentUser(req: Request, res: Response) {
  return dapi.utils.response.ok(res, req.Session.Env.curUser);
}

export function getCollaborators(_req: Request, res: Response, params: Object) {
  return dapi.utils.response.ok(
    res,
    dapi.utils.paginator.gather(
      dapi.utils.query.extract("for $e in collaborators return $e"),
      params
    )
  );
}
