import { dapi } from "../dapi";

export function write(
  message: unknown,
  type = "INFO",
  logCode = "common_log"
) {
  if (IsEmptyValue(message)) {
    write("Log message is empty", "WARNING");
    return false;
  }

  logCode = `dapi_${logCode}`;
  EnableLog(logCode, true);
  const payload = `[${StrUpperCase(type)}] ${dapi.utils.type.isObject(message) ? tools.object_to_text(message, "json") : message}`;
  LogEvent(logCode, payload);

  if (dapi.config.stderr) {
    alert(payload);
  }
}

export function info(message: unknown, logCode?: string) {
  return write(message, "INFO", logCode);
}

export function error(message: unknown, logCode: string) {
  return write(message, "ERROR", logCode);
}

export function warning(message: unknown, logCode: string) {
  return write(message, "WARNING", logCode);
}
