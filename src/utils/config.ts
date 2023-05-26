import { dapi } from "../dapi";

export function init() {
  const configUrl = "./../config.json";

  if (!FilePathExists(UrlToFilePath(configUrl))) {
    const error = `Config doesn't exist by path ${configUrl}`;
    alert(error);
    throw new Error(error);
  }
  
  dapi.config = tools.read_object(LoadUrlData(configUrl));
  // FIXME: need change to detect root folder for api
  dapi.config.api.cwd = ParentDirectory(UrlToFilePath(".")).split("/wt/web")[1];
  
  alert(`${"🚀"} Config loaded:\n${tools.object_to_text(dapi.config, "json")}`);
}
