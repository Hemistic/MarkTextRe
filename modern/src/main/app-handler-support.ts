export const createBootstrapPayload = () => {
  return {
    appName: 'MarkText Modern',
    platform: process.platform,
    versions: {
      chrome: process.versions.chrome,
      electron: process.versions.electron,
      node: process.versions.node,
      v8: process.versions.v8
    }
  }
}
