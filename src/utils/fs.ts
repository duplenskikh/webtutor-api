export function readDirSync(directoryPath: string, isRecursive = false): string[] {
  const directoryElements = ReadDirectory(directoryPath);
  let files = [];
  let i = 0;

  for (i = 0; i < directoryElements.length; i++) {
    if (IsDirectory(directoryElements[i]) && isRecursive) {
      files = ArrayUnion(files, readDirSync(directoryElements[i], isRecursive));
    } else {
      files.push(directoryElements[i]);
    }
  }

  return files;
}
