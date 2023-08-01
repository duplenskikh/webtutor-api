export function getDownloadFileUrl(objectId: number | undefined) {
  return IsEmptyValue(objectId) ? null : `/download_file.html?file_id=${objectId}`;
}
