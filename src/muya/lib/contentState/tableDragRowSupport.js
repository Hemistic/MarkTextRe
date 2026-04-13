export const switchRowData = (contentState, rows, index, curIndex, offset, start) => {
  let key = null
  let column = null
  const temp = rows[index].children.map((cell, i) => {
    if (cell.children[0].key === start.key) {
      column = i
    }
    return cell.children[0].text
  })
  if (offset > 0) {
    for (let i = index; i < curIndex; i++) {
      rows[i].children.forEach((cell, ii) => {
        cell.children[0].text = rows[i + 1].children[ii].children[0].text
      })
    }
    rows[curIndex].children.forEach((cell, i) => {
      if (i === column) {
        key = cell.children[0].key
      }
      cell.children[0].text = temp[i]
    })
  } else {
    for (let i = index; i > curIndex; i--) {
      rows[i].children.forEach((cell, ii) => {
        cell.children[0].text = rows[i - 1].children[ii].children[0].text
      })
    }
    rows[curIndex].children.forEach((cell, i) => {
      if (i === column) {
        key = cell.children[0].key
      }
      cell.children[0].text = temp[i]
    })
  }
  return key
}
