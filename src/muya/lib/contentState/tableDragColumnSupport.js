export const switchColumnData = (contentState, rows, index, curIndex, offset, start) => {
  let key = null
  for (const row of rows) {
    const isCursorCell = row.children[index].children[0].key === start.key
    const { text } = row.children[index].children[0]
    const { align } = row.children[index]
    if (offset > 0) {
      for (let i = index; i < curIndex; i++) {
        row.children[i].children[0].text = row.children[i + 1].children[0].text
        row.children[i].align = row.children[i + 1].align
      }
      row.children[curIndex].children[0].text = text
      row.children[curIndex].align = align
    } else {
      for (let i = index; i > curIndex; i--) {
        row.children[i].children[0].text = row.children[i - 1].children[0].text
        row.children[i].align = row.children[i - 1].align
      }
      row.children[curIndex].children[0].text = text
      row.children[curIndex].align = align
    }
    if (isCursorCell) {
      key = row.children[curIndex].children[0].key
    }
  }
  return key
}
