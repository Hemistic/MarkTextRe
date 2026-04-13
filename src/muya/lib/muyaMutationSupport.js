export const observeMuyaMutations = muya => {
  disconnectMuyaMutations(muya)
  const config = { childList: true, subtree: true }
  const callback = mutationsList => {
    for (const mutation of mutationsList) {
      if (mutation.type !== 'childList') {
        continue
      }

      const { removedNodes, target } = mutation
      if (removedNodes && removedNodes.length) {
        const hasTable = Array.from(removedNodes).some(node => node.nodeType === 1 && node.closest('table.ag-paragraph'))
        if (hasTable) {
          muya.eventCenter.dispatch('crashed')
          console.warn('There was a problem with the table deletion.')
        }
      }

      if (target.getAttribute('id') === 'ag-editor-id' && target.childElementCount === 0) {
        muya.eventCenter.dispatch('crashed')
        console.warn('editor crashed, and can not be input any more.')
      }
    }
  }

  const observer = new MutationObserver(callback)
  observer.observe(muya.container, config)
  muya.mutationObserver = observer
}

export const disconnectMuyaMutations = muya => {
  if (muya.mutationObserver) {
    muya.mutationObserver.disconnect()
    muya.mutationObserver = null
  }
}
