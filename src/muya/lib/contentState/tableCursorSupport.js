export const setCursor = (contentState, block, offset = 0) => {
  const { key } = block
  contentState.cursor = {
    start: { key, offset },
    end: { key, offset }
  }
}
