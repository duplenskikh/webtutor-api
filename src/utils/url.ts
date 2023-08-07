import { dapi } from "../dapi";

export function getDownloadFileUrl(objectId: number | undefined) {
  return dapi.utils.type.isUndef(objectId) ? null : `/download_file.html?file_id=${objectId}`;
}
