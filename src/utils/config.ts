import { wshcmx } from "index";

export function init() {
  const configUrl = "./../config.json";

  if (!FilePathExists(UrlToFilePath(configUrl))) {
    const error = `Config doesn't exist by path ${configUrl}`;
    // eslint-disable-next-line no-alert
    alert(error);
    throw new Error(error);
  }

  wshcmx.config = tools.read_object(LoadUrlData(configUrl));
  wshcmx.config.basepath = UrlToFilePath("./..").replace("\\", "/").split("/wt/web/")[1];

  // eslint-disable-next-line no-alert
  alert(`Config loaded:\n${tools.object_to_text(wshcmx.config, "json")}`);
}
