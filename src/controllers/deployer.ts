import { Route } from "..";
import { dapi } from "../dapi";

export function functions(): Route[] {
  return [{
    method: "POST",
    pattern: "/deploy",
    callback: "deploy",
    access: "dev",
    params: {
      file: {
        type: "string"
      }
    }
  }, {
    method: "POST",
    pattern: "/deploy/build",
    callback: "deployBuild",
    access: "dev",
    params: {
      file: {
        type: "string"
      }
    }
  }];
}

export function deploy(req: Request, res: Response, params: Object) {
  const url = `x-local://wt/web/${dapi.config.basepath}/${params.file}`;
  const newContent = req.Body;

  if (StrLen(newContent) === 0) {
    dapi.utils.log.warning(`Невозможно обновить. Файл ${url} не содержит контента`, "deployer");
    return dapi.utils.response.badRequest(res, "Пустой файл");
  }

  if (FilePathExists(UrlToFilePath(url)) && !IsDirectory(url) && Md5Hex(LoadUrlData(url)) == Md5Hex(newContent)) {
    dapi.utils.log.warning(`Хэши старой и новой версии файла ${url} сопадают`, "deployer");
    return dapi.utils.response.notModified(res);
  }

  ObtainDirectory(ParentDirectory(UrlToFilePath(url)), true);
  PutFileData(UrlToFilePath(url), newContent);
  DropFormsCache(url);
  dapi.utils.log.info(`Файл ${url} обновлен и сброшен кэш`, "deployer");
  dapi.init();

  return dapi.utils.response.ok(res, url);
}

export function deployBuild(req: Request, res: Response, params: Object) {
  req.RespContentType = "application/json";
  const packagesPath = `x-local://wt/web/${dapi.config.basepath}/packages`;
  const filePath = UrlAppendPath(packagesPath, params.file);
  const fileData = req.Body;

  const destinationZipPath = StrReplaceOne(filePath, ".zip", "");

  PutUrlData(filePath, fileData);
  ZipExtract(filePath, destinationZipPath);

  const files = dapi.utils.fs.readDirSync(destinationZipPath, true);

  let i = 0;
  let splittedFileUrl;
  let previousFilePath;

  for (i = 0; i < files.length; i++) {
    splittedFileUrl = files[i].split("/");
    splittedFileUrl.splice(splittedFileUrl.indexOf("packages"), 2);
    previousFilePath = UrlToFilePath(splittedFileUrl.join("/"));

    if (FilePathExists(previousFilePath)) {
      DeleteFile(previousFilePath);
    }

    MoveFile(UrlToFilePath(files[i]), previousFilePath);
  }

  DeleteDirectory(destinationZipPath);
  DeleteFile(filePath);

  DropFormsCache(`x-local://wt/web/${dapi.config.basepath}/*`);
  dapi.init();
}

