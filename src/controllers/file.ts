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
  }, {
    method: "PUT",
    pattern: "/file",
    callback: "uploadFile",
    access: "user",
    summary: "Загрузка файлов",
    params: {
      name: {
        type: "string",
        store: "body",
        description: "Название загружаемого файла"
      },
      content: {
        type: "string",
        store: "body",
        description: "Контент загружаемого файла"
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

export function uploadFile(req: Request, res: Response, params: Object) {
  const name = params.name;
  const content = Base64Decode(params.content);
  const extension = UrlPathSuffix(name);
  const size = StrLen(content);

  if (dapi.supportedFilesExts.indexOf(extension) === -1) {
    return dapi.utils.response.unsupportedMediaType(res);
  }

  if (size > dapi.maxFileSize) {
    return dapi.utils.response.forbidden(res, "Размер файла превышает максимально загружаемый размер");
  }

  const checksum = Md5Hex(content);
  let resourceDocument = tools.get_doc_by_key<ResourceDocument>("resource", "checksum", checksum);

  if (resourceDocument === null) {
    resourceDocument = dapi.services.file.create(req.Session.Env.curUserID, content, name);
  }

  return dapi.utils.response.ok(
    res,
    {
      name,
      extension,
      sha: checksum,
      size,
      download_url: dapi.utils.url.getDownloadFileUrl(resourceDocument.DocID),
      created: resourceDocument.TopElem.doc_info.creation.date.Value,
      modified: resourceDocument.TopElem.doc_info.modification.date.Value
    },
    201
  );
}
