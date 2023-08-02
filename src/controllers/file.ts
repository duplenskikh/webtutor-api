import { Route } from "..";
import { dapi } from "../dapi";

export function functions(): Route[] {
  return [{
    method: "GET",
    pattern: "/file",
    callback: "getFile",
    access: "user",
    summary: "Получение файла",
    params: {
      id: {
        type: "number"
      }
    }
  }];
}

export function getFile(req: Request, res: Response, params: Object) {
  const resourceDocument = tools.open_doc<ResourceDocument>(params.id);

  if (resourceDocument === undefined) {
    return dapi.utils.response.notFound(res, "Ресурс не найден");
  }

  const hasAccess = tools_web.check_access(
    resourceDocument.TopElem,
    req.Session.Env.curUserID,
    req.Session.Env.curUser,
    req.Session
  );

  if (!hasAccess) {
    return dapi.utils.response.forbidden(res, "Доступ к ресурсу запрещен");
  }

  return dapi.utils.response.binary(res, resourceDocument);
}

export function uploadFile(req: Request, res: Response) {
  const fileData = req.Query.GetOptProperty("file");
  const fileName = UrlFileName(fileData.FileName);
  // const fileSize = StrLen(fileData);
  // const fileExt = StrLowerCase(UrlPathSuffix(fileName)?.slice(1));

  // if (dapi.supportedFilesExts.indexOf(fileExt) === -1) {
  //   return dapi.utils.response.forbidden(res, "Данный тип файла не поддерживается");
  // }

  // if (fileSize > dapi.maxFileSize) {
  //   return dapi.utils.response.forbidden(res, "Размер файла превышает максимально загружаемый размер");
  // }

  const checksum = Md5Hex(fileData);
  const resourceQuery = ArrayOptFirstElem(tools.xquery(`for $e in resources where $e/checksum = ${XQueryLiteral(checksum)} return $e`));

  if (resourceQuery === undefined) {
    return dapi.utils.response.badRequest(res, "Данный файл уже был загружен ранее");
  }

  return dapi.utils.response.ok(
    res,
    dapi.services.file.create(req.Session.Env.curUserID, fileData, fileName),
    201
  );
}
