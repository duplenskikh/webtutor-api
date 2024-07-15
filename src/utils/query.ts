import { dapi } from "../dapi";

export function exec<T>(command: string) {
  return ArraySelectAll(tools.xquery<T>(command));
}

export function extract<T>(command: string) {
  const query = exec<T>(command);
  const result = [];
  let o;
  let field: unknown;

  for (let i = 0; i < query.length; i++) {
    o = {};

    for (field in query[i]) {
      o.SetProperty((field as XmlElem<unknown>).Name, extractQueryValue((field as XmlElem<unknown>).Value));
    }

    result.push(o);
  }

  return result;
}

function extractQueryValue(value: unknown) {
  if (dapi.utils.type.isDate(value)) {
    return StrMimeDate(value);
  }

  return value;
}
