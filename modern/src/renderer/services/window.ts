import { getMarkTextApi } from './api'

export const minimizeWindow = async () => {
  await getMarkTextApi()?.window.minimize?.()
}

export const maximizeWindow = async () => {
  await getMarkTextApi()?.window.maximize?.()
}

export const closeWindow = async () => {
  const close = getMarkTextApi()?.window.close
  if (!close) {
    console.error('[modern] window close bridge is unavailable')
    return
  }

  await close()
}
