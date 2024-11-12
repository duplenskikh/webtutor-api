/**
* Выполнение функции для каждого элемента массива
* @param array Массив элементов
* @param func Функция
*/
export function forEach(array: unknown[], func: Function): void {
  array = ArrayDirect(array);
  let i;

  for (i = 0; i < array.length; i++) {
    func(i, array[i]);
  }
}

/**
 * Cоздаёт новый массив с результатом вызова указанной функции для каждого элемента массива
 * @param array Массив
 * @param func Функция
 */
export function map(array: unknown[], func: Function): unknown[] {
  array = ArrayDirect(array);
  let i;
  const results = [];

  for (i = 0; i < array.length; i++) {
    results.push(func(i, array[i]));
  }

  return results;
}

/**
 * Возвращает новый массив, содержащий ключи каждого индекса в массиве.
 * @param array Массив
 */
export function keys(array: unknown[]): number[] {
  const results = [];
  let i;

  for (i = 0; i < array.length; i++) {
    results.push(i);
    i++;
  }

  return results;
}

/**
 * Удаляет последний элемент из массива и возвращает его значение.
 * @param array Массив
 */
export function pop(array: unknown[]): unknown[] {
  return ArrayRange(array, 0, ArrayCount(array) - 1);
}

/**
 * Обращает порядок следования элементов массива.
 * Первый элемент массива становится последним, а последний — первым.
 * @param array Массив
 */
export function reverse(array: unknown[]): unknown[] {
  if (!IsArray(array)) {
    throw new Error("Argument is not an array");
  }

  array = ArraySelectAll(array);

  const reverseArray = [];
  let i = 0;

  for (i = array.length - 1; i >= 0; i--) {
    reverseArray.push(array[i]);
  }

  return reverseArray;
}

export function last(array: unknown[]): unknown {
  const length = array == null ? 0 : array.length;

  return length ? array[length - 1] : undefined;
}

export function compact(array: unknown[]): unknown[] {
  let index = -1;
  let length = array == null ? 0 : array.length;
  let resIndex = 0;
  let result = [];
  let value;

  while (++index < length - 1) {
    value = array[index];

    if (value && value !== null && value !== undefined) {
      result[resIndex++] = value;
    }
  }

  return result;
}

export function excludeValues<T>(source: T[], keys: T[]) {
  const arr = [];
  let i = 0;

  for (i = 0; i < source.length; i++) {
    if (keys.indexOf(source[i]) !== -1) {
      continue;
    }

    arr.push(source[i]);
  }

  return arr;
}
