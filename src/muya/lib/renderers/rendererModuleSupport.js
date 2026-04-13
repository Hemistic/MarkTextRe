const isObjectLike = value => (typeof value === 'object' || typeof value === 'function') && value !== null

const unwrapDefaultExport = module => {
  let current = module

  for (let i = 0; i < 3; i++) {
    if (!isObjectLike(current) || !('default' in current)) {
      break
    }

    const next = current.default

    if (!next || next === current) {
      break
    }

    current = next
  }

  return current
}

const resolveVegaRenderer = (module, unwrappedModule) => {
  if (typeof unwrappedModule === 'function') {
    return unwrappedModule
  }

  if (isObjectLike(unwrappedModule) && typeof unwrappedModule.embed === 'function') {
    return unwrappedModule.embed
  }

  if (isObjectLike(module) && typeof module.embed === 'function') {
    return module.embed
  }

  return unwrappedModule
}

export const normalizeRendererModule = (name, module) => {
  const unwrappedModule = unwrapDefaultExport(module)

  if (name === 'vega-lite') {
    return resolveVegaRenderer(module, unwrappedModule)
  }

  return unwrappedModule
}
