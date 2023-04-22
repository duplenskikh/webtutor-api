export function isString(value: unknown): value is string {
  return DataType(value) == "string";
}

export function isObject(value: unknown): value is object {
  return DataType(value) == "object";
}

export function isArray(value: unknown): value is any[] {
  return DataType(value) == "object" && IsArray(value);
}

export function isNumber(value: unknown): value is number {
  return DataType(value) == "integer";
}

export function isReal(value: number) {
  return DataType(value) == "real" && value !== (value ^ 0);
}

export function isBoolean(value: unknown): value is boolean {
  return DataType(value) == "bool";
}

export function isUndef(value: unknown): value is null | undefined {
  return value === undefined || value === null;
}

export type Primitive = number | boolean | string;

export function isPrimitive(value: unknown): value is Primitive {
  const type = DataType(value);
  return type == "integer" || type == "float" || type == "bool" || type == "string" || value === undefined || value === null;
}

/**
 * Проверяет равна ли функция `null`, `undefined` или ``.
 * @param { any } value Проверяемое значение.
 * @returns { boolean }
 */
export function isNull(value: unknown): value is undefined | null | "" {
  const valueType = DataType(value);

  return valueType == "object" || valueType == "array"
    ? false
    : value == undefined || value == null || value == "";
}

/**
 * Возвращает тип переданного значения.
 * @param { any } entity Значение.
 * @param { boolean } [getRValue=false] Возвращать RValue от значения.
 * @returns { string }
 */
export function entityType(entity: unknown, getRValue = false): string {
  const type = ObjectType(entity);

  if (type == "XmLdsSeq") {
    return (entity as XmlElem<unknown>).PrimaryKey == "" ? "SqlRow" : "XQueryRow";
  }

  let dataType = DataType(entity);

  if (dataType == "XmElem" && getRValue) {
    try {
      dataType = DataType(RValue(entity));

      if (!isNull(dataType)) {
        return dataType;
      }
    } catch (err) {
      // ...
    }
  }

  if (dataType != "object") {
    return dataType;
  }

  try {
    (entity as XmlDocument).TopElem;

    return "XmDoc";
  } catch (err) {
    try {
      (entity as XmlTopElem).Doc;

      return "XmElem";
    } catch (err) {
      if (IsArray(entity)) {
        return "array";
      }

      return type;
    }
  }
}

/**
 * Выполняет функцию `makeSafe` над всеми элементами входного массива.
 * @param { Array } entityArray Входной массив.
 * @param { string } [targetType=string] Целевой тип значния.
 * @param { any } [defaultValue=null] Значение по-умолчанию, если проверка не пройдена.
 */
export function makeArraySafe(
  entityArray: (string | number)[],
  targetType?: string,
  defaultValue?: unknown
): unknown[] {
  let _safetyArray = [];

  let _entity;
  let _safetyEntity;

  for (_entity in entityArray) {
    _safetyEntity = makeSafe(_entity, targetType, defaultValue);
    _safetyArray.push(_safetyEntity);
  }

  return _safetyArray;
}

/**
 * Выполняет коробочные функции "обезвреживания" данных над входным значением.
 * @param { any } entity Входное значение.
 * @param { string } [targetType=string] Целевой тип значния.
 * @param { any } [defaultValue=null] Значение по-умолчанию, если проверка не пройдена.
 * */
export function makeSafe(entity: any, targetType?: string, defaultValue?: unknown): unknown {
  targetType = targetType != undefined ? StrLowerCase(targetType) : "string";
  defaultValue = defaultValue != undefined ? defaultValue : null;

  let _safetyEntity: any = tools_web.convert_xss(entity);

  switch (targetType) {
    case "integer":
    case "number":
    case "int":
      _safetyEntity = OptInt(_safetyEntity, defaultValue as number);
      break;
    case "real":
      _safetyEntity = OptReal(_safetyEntity, defaultValue as number);
      break;
    case "xquery":
      _safetyEntity = XQueryLiteral(_safetyEntity);
      break;
    case "sql":
      _safetyEntity = SqlLiteral(_safetyEntity);
      break;
    case "boolean":
      _safetyEntity = tools_web.is_true(_safetyEntity);
      break;
    case "date":
      _safetyEntity = OptDate(_safetyEntity, defaultValue);
      break;
  }

  return _safetyEntity;
}

export function getValue(value: unknown) {
  const type = entityType(value);

  if (type == "XmElem" || type == "string" || type == "integer") {
    return RValue(value);
  }

  return value;
}

