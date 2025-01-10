import { wshcmx } from "../index";

export function getDownloadFileUrl(objectId: number | undefined) {
  return wshcmx.utils.type.isUndef(objectId) ? null : `/download_file.html?file_id=${objectId}`;
}
