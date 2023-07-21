import { HandlerParams, Route } from "..";
import { dapi } from "../dapi";

export function functions(): Route[] {
  return [{
    method: "GET",
    pattern: "/position",
    callback: "getPosition",
    access: "user",
    params: {
      id: {
        type: "number",
        convert: true
      }
    }
  }];
}

export function getPosition(params: HandlerParams, Request: Request) {
  const positionDocument = tools.open_doc<PositionDocument>(params.id);

  if (positionDocument === undefined) {
    return dapi.utils.response.notFound(`Должности по id ${params.id} не существует`);
  }

  return dapi.utils.response.ok({
    id: positionDocument.DocID,
    code: positionDocument.TopElem.code.Value,
    name: positionDocument.TopElem.name.Value,
  });
}
