import { Route } from "..";
import { dapi } from "../dapi";

export function functions(): Route[] {
  return [{
    method: "GET",
    pattern: "/agent.test/getArray",
    callback: "getArrayAgentParam",
    access: "anonymous"
  }, {
    method: "GET",
    pattern: "/agent.test/getBoolean",
    callback: "getBooleanAgentParam",
    access: "anonymous"
  }, {
    method: "GET",
    pattern: "/agent.test/getDate",
    callback: "getDateAgentParam",
    access: "anonymous"
  }, {
    method: "GET",
    pattern: "/agent.test/getDocument",
    callback: "getDocumentAgentParam",
    access: "anonymous"
  }, {
    method: "GET",
    pattern: "/agent.test/getList",
    callback: "getListAgentParam",
    access: "anonymous"
  }, {
    method: "GET",
    pattern: "/agent.test/getNumber",
    callback: "getNumberAgentParam",
    access: "anonymous"
  }, {
    method: "GET",
    pattern: "/agent.test/getString",
    callback: "getStringAgentParam",
    access: "anonymous"
  }];
}

export function getArrayAgentParam(req: Request, res: Response) {
  return dapi.utils.response.ok(
    res,
    dapi.utils.agent.getArray(
      {
        collaborators_ids: "[{\"__value\":\"0x60A3C6D17CED7D11\"},{\"__value\":\"0x609D1F05762DBDD9\"}]",
      },
      "collaborators_ids",
      true,
      "number"
    )
  );
}

export function getBooleanAgentParam(req: Request, res: Response) {
  return dapi.utils.response.ok(
    res,
    dapi.utils.agent.getBoolean(
      {
        is_dismiss: true
      },
      "is_dismiss",
      true
    )
  );
}

export function getDateAgentParam(req: Request, res: Response) {
  return dapi.utils.response.ok(
    res,
    dapi.utils.agent.getDate(
      {
        dismiss_date: "11/11/11"
      },
      "dismiss_date",
      true
    )
  );
}

export function getDocumentAgentParam(req: Request, res: Response) {
  return dapi.utils.response.ok(
    res,
    dapi.utils.agent.getDocument(
      {
        collaborator_id: "1105387902724063523"
      },
      "collaborator_id",
      true
    ).DocID
  );
}

export function getListAgentParam(req: Request, res: Response) {
  return dapi.utils.response.ok(
    res,
    dapi.utils.agent.getList(
      {
        list_variable: " ;  value1;value2;value3  ;    value 4    ;        "
      },
      "list_variable",
      true
    )
  );
}

export function getNumberAgentParam(req: Request, res: Response) {
  return dapi.utils.response.ok(
    res,
    dapi.utils.agent.getNumber(
      {
        number: 4
      },
      "number",
      true
    )
  );
}

export function getStringAgentParam(req: Request, res: Response) {
  return dapi.utils.response.ok(
    res,
    dapi.utils.agent.getString(
      {
        string: "String value"
      },
      "string",
      true
    )
  );
}
