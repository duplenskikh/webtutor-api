import { HandlerParams, Route } from "..";
import { dapi } from "../dapi";

export function functions(): Route[] {
  return [{
    method: "GET",
    pattern: "/deploy",
    callback: "deploy",
    access: "application",
    params: {
      file: {
        type: "string"
      }
    }
  }];
}

export function deploy(params: HandlerParams,req: Request) {
  const url = UrlAppendPath(dapi.config.api.basepath, params.file);

  const newContent = req.Body;

  if (StrLen(newContent) === 0) {
    dapi.utils.log.warning(`Невозможно обновить. Файл ${url} не содержит контента`, "deployer");
    return dapi.utils.response.abort("Empty file content", 400);
  }
  
  if (FilePathExists(UrlToFilePath(url)) && !IsDirectory(url) && Md5Hex(LoadUrlData(url)) == Md5Hex(newContent)) {
    dapi.utils.log.warning(`Хэши старой и новой версии файла ${url} сопадают`, "deployer");
    return dapi.utils.response.ok(null, 304);
  }


  ObtainDirectory(ParentDirectory(UrlToFilePath(url)), true);
  PutFileData(UrlToFilePath(url), newContent);
  DropFormsCache(url);
  dapi.utils.log.info(`Файл ${url} обновлен и сброшен кэш`, "deployer");
  dapi.init();

  return dapi.utils.response.ok(url);
}

export function deployBuild(req: Request) {
  req.RespContentType = "application/json";
  const fileData = req.Query.GetOptProperty("file");
  const fileName = UrlFileName(fileData.FileName);
  const baseUrl = "x-local://wt/web/" + dapi.config.api.basepath;
  const filePath = UrlAppendPath(baseUrl, fileName);
  const zipUnpackPath = UrlAppendPath(baseUrl, fileName.split(".")[0]);

  PutUrlData(filePath, fileData);
  ZipExtract(filePath, zipUnpackPath);
  
  const files = dapi.utils.fs.readDirSync(filePath, true);

  let previousFilePath;
  let i = 0;

  for (i = 0; i < files.length; i++) {
    previousFilePath = UrlToFilePath(files[i].replace(filePath, "x-local://wt/web/" + dapi.config.api.basepath));

    if (FilePathExists(previousFilePath)) {
      DeleteFile(previousFilePath);
    }

    MoveFile(
      UrlToFilePath(files[i]),
      UrlToFilePath(files[i].replace(filePath, "x-local://wt/web/" + dapi.config.api.basepath))
    );
  }

  DeleteDirectory(filePath);
  DeleteFile(filePath);

  return dapi.utils.response.ok(true);
}

