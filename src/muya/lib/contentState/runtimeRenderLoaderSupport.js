let stateRenderModulePromise = null

const loadStateRenderConstructor = async () => {
  if (!stateRenderModulePromise) {
    stateRenderModulePromise = import('../parser/render').then(module => module.default)
  }

  return stateRenderModulePromise
}

export const ensureContentStateRender = async (contentState, muya) => {
  if (contentState.stateRender) {
    return contentState.stateRender
  }

  const StateRender = await loadStateRenderConstructor()
  contentState.stateRender = new StateRender(muya)
  if (contentState.runtime) {
    contentState.runtime.stateRenderReady = true
  }
  return contentState.stateRender
}
