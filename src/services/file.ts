export function create(userId: number, fileData: string, fileName: string) {
  const resourceDocument = tools.new_doc_by_name<ResourceDocument>("resource");
  resourceDocument.BindToDb();
  resourceDocument.TopElem.person_id.Value = userId;
  const checksum = Md5Hex(fileData);
  tools.common_filling("collaborator", resourceDocument.TopElem, userId);
  resourceDocument.TopElem.name.Value = resourceDocument.TopElem.file_name.Value = fileName;
  resourceDocument.TopElem.put_str(fileData, fileName);
  resourceDocument.TopElem.checksum.Value = checksum;
  resourceDocument.Save();
  return resourceDocument;
}
