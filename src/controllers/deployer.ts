import { Route } from "..";
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
  }, {
    method: "GET",
    pattern: "/deploy/build",
    callback: "deployBuild",
    access: "application",
    params: {
      file: {
        type: "string"
      }
    }
  }];
}

export function deploy(params: Object, req: Request) {
  const url = `x-local://wt/web/${dapi.config.basepath}/${params.file}`;
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

export function deployBuild(params: Object, req: Request) {
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
}

