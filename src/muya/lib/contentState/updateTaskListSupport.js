import { getContentStateOptions } from './runtimeOptionSupport'

export const updateTaskListItem = (contentState, block, type, marker = '') => {
  const { preferLooseListItem } = getContentStateOptions(contentState)
  const parent = contentState.getParent(block)
  const grandpa = contentState.getParent(parent)
  const checked = /\[x\]\s/i.test(marker)
  const checkbox = contentState.createBlock('input', {
    checked
  })
  const { start, end } = contentState.cursor

  contentState.insertBefore(checkbox, block)
  block.children[0].text = block.children[0].text.substring(marker.length)
  parent.listItemType = 'task'
  parent.isLooseListItem = preferLooseListItem

  let taskListWrapper
  if (contentState.isOnlyChild(parent)) {
    grandpa.listType = 'task'
  } else if (contentState.isFirstChild(parent) || contentState.isLastChild(parent)) {
    taskListWrapper = contentState.createBlock('ul', {
      listType: 'task'
    })

    contentState.isFirstChild(parent)
      ? contentState.insertBefore(taskListWrapper, grandpa)
      : contentState.insertAfter(taskListWrapper, grandpa)
    contentState.removeBlock(parent)
    contentState.appendChild(taskListWrapper, parent)
  } else {
    taskListWrapper = contentState.createBlock('ul', {
      listType: 'task'
    })

    const bulletListWrapper = contentState.createBlock('ul', {
      listType: 'bullet'
    })

    let preSibling = contentState.getPreSibling(parent)
    while (preSibling) {
      contentState.removeBlock(preSibling)
      if (bulletListWrapper.children.length) {
        const firstChild = bulletListWrapper.children[0]
        contentState.insertBefore(preSibling, firstChild)
      } else {
        contentState.appendChild(bulletListWrapper, preSibling)
      }
      preSibling = contentState.getPreSibling(preSibling)
    }

    contentState.removeBlock(parent)
    contentState.appendChild(taskListWrapper, parent)
    contentState.insertBefore(taskListWrapper, grandpa)
    contentState.insertBefore(bulletListWrapper, taskListWrapper)
  }

  contentState.cursor = {
    start: {
      key: start.key,
      offset: Math.max(0, start.offset - marker.length)
    },
    end: {
      key: end.key,
      offset: Math.max(0, end.offset - marker.length)
    }
  }

  return taskListWrapper || grandpa
}
