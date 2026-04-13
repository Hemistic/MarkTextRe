const createFilesApi = ({ channels, invoke }) => {
  const { files } = channels

  return {
    getRecentDocuments: () => invoke(files.getRecentDocuments),
    removeRecentDocument: pathname => invoke(files.removeRecentDocument, pathname),
    openMarkdown: () => invoke(files.openMarkdown),
    openMarkdownAtPath: pathname => invoke(files.openMarkdownAtPath, pathname),
    saveMarkdown: input => invoke(files.saveMarkdown, input),
    saveMarkdownAs: input => invoke(files.saveMarkdownAs, input)
  }
}

module.exports = {
  createFilesApi
}
