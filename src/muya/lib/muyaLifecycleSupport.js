import ContentState from './contentState'
import EventCenter from './eventHandler/event'
import MouseEvent from './eventHandler/mouseEvent'
import Clipboard from './eventHandler/clipboard'
import Keyboard from './eventHandler/keyboard'
import DragDrop from './eventHandler/dragDrop'
import Resize from './eventHandler/resize'
import ClickEvent from './eventHandler/clickEvent'
import { ensureContentStateRender } from './contentState/runtimeRenderLoaderSupport'
import {
  releaseContentStateRender,
  setContentStateRenderContainer
} from './contentState/runtimeRenderAccessSupport'
import { createMuyaContainer } from './muyaContainerSupport'
import {
  disconnectMuyaMutations,
  observeMuyaMutations
} from './muyaMutationSupport'
import selection from './selection'
import ToolTip from './ui/tooltip'
import './assets/styles/index.css'

export const attachMuyaPlugins = (muya, plugins) => {
  if (!plugins.length) {
    return
  }

  for (const { plugin: Plugin, options } of plugins) {
    muya[Plugin.pluginName] = new Plugin(muya, options)
  }
}

export const initializeMuyaRuntime = (muya, originContainer, options, plugins) => {
  const { markdown } = options

  muya.options = options
  muya.markdown = markdown
  muya.container = createMuyaContainer(originContainer, options)
  muya.eventCenter = new EventCenter()
  muya.tooltip = new ToolTip(muya)

  attachMuyaPlugins(muya, plugins)

  muya.contentState = new ContentState(muya, options)
  muya.clipboard = new Clipboard(muya)
  muya.clickEvent = new ClickEvent(muya)
  muya.keyboard = new Keyboard(muya)
  muya.dragdrop = new DragDrop(muya)
  muya.resize = new Resize(muya)
  muya.mouseEvent = new MouseEvent(muya)
}

export const initializeMuya = async muya => {
  const { container, contentState, eventCenter } = muya

  selection.setRoot(container)
  await ensureContentStateRender(contentState, muya)
  setContentStateRenderContainer(contentState, container.firstElementChild)
  eventCenter.subscribe('stateChange', muya.dispatchChange)
  muya.setMarkdown(muya.markdown)
  muya.setFocusMode(muya.options.focusMode)
  observeMuyaMutations(muya)
  eventCenter.attachDOMEvent(container, 'focus', () => {
    eventCenter.dispatch('focus')
  })
  eventCenter.attachDOMEvent(container, 'blur', () => {
    eventCenter.dispatch('blur')
  })
}

export const destroyMuya = muya => {
  if (muya.contentState.runtime) {
    muya.contentState.runtime.destroyed = true
  }
  disconnectMuyaMutations(muya)
  releaseContentStateRender(muya.contentState)
  selection.setRoot(null)
  muya.contentState.clear()

  const destroyables = [
    muya.tooltip,
    muya.quickInsert,
    muya.codePicker,
    muya.tablePicker,
    muya.emojiPicker,
    muya.imagePathPicker,
    muya.keyboard
  ]

  for (const plugin of destroyables) {
    if (plugin && typeof plugin.destroy === 'function') {
      plugin.destroy()
    }
  }

  muya.eventCenter.unsubscribe('stateChange', muya.dispatchChange)
  muya.eventCenter.destroy()
}
