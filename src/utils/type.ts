export function isArray(value: unknown): value is unknown[] {
  return DataType(value) == "object" && IsArray(value) && ObjectType(value) == "JsArray";
}

export function isBinary(value: unknown): value is Binary {
  return ObjectType(value) == "JsBinary";
}

export function isBoolean(value: unknown): value is boolean {
  return DataType(value) == "bool";
}

export function isDate(value: unknown): value is Date {
  return DataType(value) == "date" || OptDate(value) !== undefined;
}

export function isError(value: unknown): value is Error {
  return ObjectType(value) == "BmErrorInfo";
}

/**
 * Проверяет равна ли функция `null`, `undefined` или ``.
 * @param { any } value Проверяемое значение.
 * @returns { boolean }
 */
export function isNull(v: unknown): v is undefined | null | "" {
  return isObject(v) || isArray(v) ? false : (v === undefined || v === null || StrCharCount(v as string) === 0);
}

export function isNumber(value: unknown): value is number {
  return DataType(value) == "integer";
}

export function isObject(value: unknown): value is object {
  return DataType(value) == "object" && ObjectType(value) == "JsObject";
}

export function isPrimitive(value: unknown): value is (number | boolean | string | undefined | null) {
  const type = DataType(value);
  return (
    type == "integer"
    || type == "float"
    || type == "bool"
    || type == "string"
    || value === undefined
    || value === null
  );
}

export function isReal(value: number) {
  return DataType(value) == "real" && value !== (value ^ 0);
}

export function isString(value: unknown): value is string {
  return DataType(value) == "string";
}

export function isUndef(value: unknown): value is null | undefined {
  return value === undefined || value === null;
}

/**
 * Выполняет функцию `makeSafe` над всеми элементами входного массива.
 * @param { Array } entityArray Входной массив.
 * @param { string } [targetType=string] Целевой тип значния.
 * @param { any } [defaultValue=null] Значение по-умолчанию, если проверка не пройдена.
 */
export function makeArraySafe(
  arr: unknown[],
  targetType?: string,
  defaultValue?: unknown
): unknown[] {
  let result = [];
  let i;

  for (i = 0; i < arr.length; i++) {
    result.push(makeSafe(arr[i], targetType, defaultValue));
  }

  return result;
}

/**
 * Выполняет коробочные функции "обезвреживания" данных над входным значением.
 * @param { any } entity Входное значение.
 * @param { string } [targetType=string] Целевой тип значния.
 * @param { any } [defaultValue=null] Значение по-умолчанию, если проверка не пройдена.
 * */
export function makeSafe<T>(entity: T, targetType?: string, defaultValue?: unknown): unknown {
  targetType = targetType != undefined ? StrLowerCase(targetType) : "string";
  defaultValue = defaultValue != undefined ? defaultValue : null;

  let _safetyEntity = tools_web.convert_xss(entity as string);

  switch (targetType) {
    case "integer":
    case "number":
    case "int":
      return OptInt(_safetyEntity, defaultValue as number);
    case "real":
      return OptReal(_safetyEntity, defaultValue as number);
    case "xquery":
      return XQueryLiteral(_safetyEntity);
    case "sql":
      return SqlLiteral(_safetyEntity);
    case "boolean":
      return tools_web.is_true(_safetyEntity);
    case "date":
      return OptDate(_safetyEntity, defaultValue);
  }

  return _safetyEntity;
}
