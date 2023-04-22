/**
 * Получение значения заголовка запроса
 * @param Request запрос Request WT
 * @param name имя заголовка
*/
export function getHeader(headers: object, name: string): string | null {
  const lowerCaseName = StrLowerCase(name);
  let header;

  for (header in headers) {
    if (StrLowerCase(header) == lowerCaseName) {
      const headerValue = headers.GetOptProperty(header);

      if (headerValue === undefined) {
        return null;
      }

      return Trim(String(headerValue));
    }
  }

  return null;
}
