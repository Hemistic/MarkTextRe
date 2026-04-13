export const readFileSync = () => {
  throw new Error('fs.readFileSync is unavailable in the renderer process.')
}

const fs = {
  readFileSync
}

export default fs
