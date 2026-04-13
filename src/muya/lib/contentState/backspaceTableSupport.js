
export const tableHasContent = table => {
  const tHead = table.children[0]
  const tBody = table.children[1]
  const tHeadHasContent = tHead.children[0].children.some(th => th.children[0].text.trim())
  const tBodyHasContent = tBody.children.some(row => row.children.some(td => td.children[0].text.trim()))
  return tHeadHasContent || tBodyHasContent
}
