import { dapi } from "index";

export function exec<T>(command: string) {
  return ArraySelectAll(tools.xquery<T>(command));
}

export function extract<T>(command: string) {
  const query = exec<T>(command);
  const result = [];
  let o;
  let field: any;

  for (let i = 0; i < query.length; i++) {
    o = {};

    for (field in query[i]) {
      o.SetProperty(field.Name, extractQueryValue(field.Value));
    }

    result.push(o);
  }

  return result;
}

function extractQueryValue(value: any) {
  if (dapi.utils.type.isDate(value)) {
    return StrMimeDate(value);
  }

  return value;
}
