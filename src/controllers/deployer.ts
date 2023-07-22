import { HandlerParams, Route } from "..";
import { dapi } from "../dapi";

export function functions(): Route[] {
  return [{
    method: "GET",
    pattern: "/deploy",
    callback: "deploy",
    access: "application",
    params: {
      filepath: {
        type: "string"
      }
    }
  }];
}

export function deploy(params: HandlerParams,req: Request) {
  const fileUrl = UrlAppendPath("x-local://wt/web", params.filepath);

  let oldContent;
  let oldHash;

  if (FilePathExists(UrlToFilePath(fileUrl)) && !IsDirectory(fileUrl)) {
    oldContent = LoadUrlData(fileUrl);
    oldHash = Md5Hex(oldContent);
  }

  const newContent = req.Body;

  if (StrLen(newContent) === 0) {
    dapi.utils.log.warning(`Невозможно обновить. Файл ${fileUrl} не содержит контента`, "deployer");
    return dapi.utils.response.abort("Empty file content", 400);
  }
  
  const newHash = Md5Hex(newContent);

  if (oldHash == newHash) {
    dapi.utils.log.warning(`Невозможно обновить. Хэши предыдущей и текущей версии файла ${fileUrl} сопадают`, "deployer");
    return dapi.utils.response.ok(null, 304);
  };

  ObtainDirectory(ParentDirectory(UrlToFilePath(fileUrl)), true);
  PutFileData(UrlToFilePath(fileUrl), newContent);
  DropFormsCache(fileUrl);
  dapi.utils.log.info(`Файл ${fileUrl} обновлен и сброшен кэш`, "deployer");
  dapi.init();

  return dapi.utils.response.ok(fileUrl);
}

export function deployBuild(req: Request) {
  req.RespContentType = "application/json";
  const fileData = req.Query.GetOptProperty("file");
  const fileName = UrlFileName(fileData.FileName);
  const baseUrl = "x-local://wt/web/" + dapi.config.api.cwd;
  const filePath = UrlAppendPath(baseUrl, fileName);
  const zipUnpackPath = UrlAppendPath(baseUrl, fileName.split(".")[0]);

  PutUrlData(filePath, fileData);
  ZipExtract(filePath, zipUnpackPath);
  
  const files = dapi.utils.fs.readDirSync(filePath, true);

  let previousFilePath;
  let i = 0;

  for (i = 0; i < files.length; i++) {
    previousFilePath = UrlToFilePath(files[i].replace(filePath, "x-local://wt/web/" + dapi.config.api.cwd));

    if (FilePathExists(previousFilePath)) {
      DeleteFile(previousFilePath);
    }

    MoveFile(
      UrlToFilePath(files[i]),
      UrlToFilePath(files[i].replace(filePath, "x-local://wt/web/" + dapi.config.api.cwd))
    );
  }

  DeleteDirectory(filePath);
  DeleteFile(filePath);

  return dapi.utils.response.ok(true);
}

