export function create(userId: number, content: string, name: string) {
  const resourceDocument = tools.new_doc_by_name<ResourceDocument>("resource");
  resourceDocument.BindToDb();
  resourceDocument.TopElem.person_id.Value = userId;
  const checksum = Md5Hex(content);
  tools.common_filling("collaborator", resourceDocument.TopElem, userId);
  resourceDocument.TopElem.name.Value = resourceDocument.TopElem.file_name.Value = name;
  resourceDocument.TopElem.put_str(content, name);
  resourceDocument.TopElem.checksum.Value = checksum;
  resourceDocument.Save();
  return resourceDocument;
}
