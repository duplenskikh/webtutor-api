export function readDirSync(path: string, isRecursive = false, files: string[] = []): string[] {
  const dirElements = ReadDirectory(path);
  let i = 0;

  for (i = 0; i < dirElements.length; i++) {
    if (IsDirectory(dirElements[i]) && isRecursive) {
      files = ArrayUnion(files, readDirSync(dirElements[i], isRecursive, files));
    } else {
      files.push(dirElements[i]);
    }
  }

  return files;
}
