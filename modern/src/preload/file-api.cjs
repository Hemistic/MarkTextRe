const createFilesApi = ({ channels, invoke }) => {
  const { files } = channels

  return {
    getRecentDocuments: () => invoke(files.getRecentDocuments),
    removeRecentDocument: pathname => invoke(files.removeRecentDocument, pathname),
    pickOpenPaths: () => invoke(files.pickOpenPaths),
    openMarkdown: () => invoke(files.openMarkdown),
    openMarkdownInNewWindow: () => invoke(files.openMarkdownInNewWindow),
    openMarkdownAtPath: pathname => invoke(files.openMarkdownAtPath, pathname),
    openMarkdownAtPathInNewWindow: pathname => invoke(files.openMarkdownAtPathInNewWindow, pathname),
    openFolder: () => invoke(files.openFolder),
    openFolderAtPath: pathname => invoke(files.openFolderAtPath, pathname),
    openFolderInNewWindow: () => invoke(files.openFolderInNewWindow),
    openFolderAtPathInNewWindow: pathname => invoke(files.openFolderAtPathInNewWindow, pathname),
    pickImage: () => invoke(files.pickImage),
    processLocalImage: input => invoke(files.processLocalImage, input),
    saveMarkdown: input => invoke(files.saveMarkdown, input),
    saveMarkdownAs: input => invoke(files.saveMarkdownAs, input)
  }
}

module.exports = {
  createFilesApi
}
