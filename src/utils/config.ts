import { dapi } from "../dapi";

export function init() {
  const configUrl = "./../config.json";

  if (!FilePathExists(UrlToFilePath(configUrl))) {
    const error = `Config doesn't exist by path ${configUrl}`;
    alert(error);
    throw new Error(error);
  }

  dapi.config = tools.read_object(LoadUrlData(configUrl));
  dapi.basepath = UrlToFilePath("./..");

  alert(`Config loaded:\n${tools.object_to_text(dapi.config, "json")}`);
}
