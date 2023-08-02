import { Route } from "..";
import { dapi } from "../dapi";

export function functions(): Route[] {
  return [{
    method: "GET",
    pattern: "/list",
    callback: "getList",
    access: "both",
    summary: "Получения стандартного списка по параметрам",
    params: {
      name: {
        type: "string",
        optional: false
      }
    }
  }, {
    method: "GET",
    pattern: "/lists",
    callback: "getAllLists",
    access: "both",
    summary: "Получение стандартных списков по параметрам",
    params: {
      sort: {
        type: "string",
        store: "query",
        optional: true,
        val: "asc",
        example: "asc"
      }
    }
  }];
}

export function getList(req: Request, res: Response, params: Object) {
  let list;

  if (common.PathExists(params.name)) {
    list = common.EvalPath(params.name);
  } else if (lists.PathExists(params.name)) {
    list = lists.EvalPath(params.name);
  } else {
    return dapi.utils.response.notFound(res, "Список не найден");
  }

  return dapi.utils.response.ok(res, ArrayExtract(list, "({ id: id.Value, name: name.Value })"));
}

export function getAllLists(req: Request, res: Response, params: Object) {
  return dapi.utils.response.ok(
    res,
    ArraySort(
      ArrayUnion(
        ArrayExtract(lists, "This.Name"),
        ArrayExtract(common, "This.Name")
      ),
      "This",
      StrLowerCase(params.sort) === "desc" ? "-" : "+"
    )
  );
}
