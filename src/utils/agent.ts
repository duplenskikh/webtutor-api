import { dapi } from "../dapi";

export function getArray<T extends Object = {}>(
  param: T,
  name: string,
  isRequired = false,
  itemType: "number" | "string" | "date" | "boolean" = "string"
) {
  const val = getInput(param, name, isRequired);

  const arr = tools.read_object<{ __value: unknown; }[]>(val as string);

  if (!IsArray(arr)) {
    throw new Error(`Параметр "${name}" не является массивом`);
  }

  if (arr.length === 0 && isRequired) {
    throw new Error(`Параметр "${name}" является пустым массивом`);
  }

  const values = [];
  let originValue;
  let convertedValue;

  for (let i = 0; i < arr.length; i++) {
    originValue = arr[i].__value;

    if (originValue === null) {
      continue;
    }

    if (itemType == "number") {
      convertedValue = OptInt(originValue, null);
    } else if (itemType == "boolean") {
      convertedValue = tools_web.is_true(originValue);
    } else if (itemType == "date") {
      convertedValue = OptDate(originValue, null);
    } else {
      if (convertedValue !== null) {
        convertedValue = String(originValue);
      }
    }

    values.push(convertedValue);
  }

  return values;
}

export function getBoolean<T extends Object = {}>(
  param: T,
  name: string,
  isRequired = false
) {
  return tools_web.is_true(getInput(param, name, isRequired));
}

export function getDate<T extends Object = {}>(
  param: T,
  name: string,
  isRequired = false
) {
  const val = OptDate(getString(param, name, isRequired), null);

  if (isRequired && val === null) {
    throw new Error(`Дата "${name}" не валидна`);
  }

  return val;
}

export function getDocument<T extends Object = {}>(
  param: T,
  name: string,
  isRequired = false,
  catalog?: string
) {
  const val = getNumber(param, name, isRequired);

  const doc = tools.open_doc(val as number);

  if (isRequired && doc === undefined) {
    throw new Error(`Документ по id "${val}" не найден в базе данных`);
  }

  if (catalog !== undefined && doc.TopElem.Name != catalog) {
    throw new Error(`Документ, найденный по id "${val}" находится в каталоге ${doc.TopElem.Name}, а не в ${catalog}`);
  }

  return doc;
}

export function getInput<T extends Object = {}>(
  param: T,
  name: string,
  isRequired = false
) {
  if (isRequired && !param.HasProperty(name)) {
    throw new Error(`Параметр "${name}" не определен`);
  }

  const val = param.GetOptProperty(name, null);

  if (isRequired && dapi.utils.type.isUndef(val)) {
    throw new Error(`Параметр "${name}" не может быть null`);
  }

  return val;
}

export function getList<T extends Object = {}>(
  param: T,
  name: string,
  isRequired = false
) {
  const val = String(getInput(param, name, isRequired));
  const values = val.split(";");

  const result = [];
  let i;
  let _v;

  for (i = 0; i < values.length; i++) {
    _v = Trim(String(values[i]));

    if (dapi.utils.type.isEmptyString(_v)) {
      continue;
    }

    result.push(_v);
  }

  return result;
}

export function getNumber<T extends Object = {}>(
  param: T,
  name: string,
  isRequired = false,
  isReal = false
) {
  const val = getInput(param, name, isRequired);
  const intVal = OptInt(val);

  if (isRequired && OptInt(val) === undefined) {
    throw new Error(`Параметр "${name}" не является числом`);
  }

  const realVal = OptReal(val);

  if (!isReal && realVal !== intVal) {
    return intVal;
  } else {
    return realVal;
  }
}

export function getString<T extends Object = {}>(
  param: T,
  name: string,
  isRequired = false
) {
  const val = getInput(param, name, isRequired);

  if (val === null) {
    return null;
  }

  return RValue(String(val));
}
