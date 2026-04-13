import enterCtrl from './enterCtrl'
import updateCtrl from './updateCtrl'
import backspaceCtrl from './backspaceCtrl'
import deleteCtrl from './deleteCtrl'
import codeBlockCtrl from './codeBlockCtrl'
import tableBlockCtrl from './tableBlockCtrl'
import tableDragBarCtrl from './tableDragBarCtrl'
import tableSelectCellsCtrl from './tableSelectCellsCtrl'
import coreApi from './core'
import marktextApi from './marktext'
import arrowCtrl from './arrowCtrl'
import pasteCtrl from './pasteCtrl'
import copyCutCtrl from './copyCutCtrl'
import paragraphCtrl from './paragraphCtrl'
import tabCtrl from './tabCtrl'
import formatCtrl from './formatCtrl'
import searchCtrl from './searchCtrl'
import containerCtrl from './containerCtrl'
import htmlBlockCtrl from './htmlBlock'
import clickCtrl from './clickCtrl'
import inputCtrl from './inputCtrl'
import tocCtrl from './tocCtrl'
import emojiCtrl from './emojiCtrl'
import imageCtrl from './imageCtrl'
import linkCtrl from './linkCtrl'
import dragDropCtrl from './dragDropCtrl'
import footnoteCtrl from './footnoteCtrl'
import blockState from './blockState'
import renderState from './renderState'

export const CONTENT_STATE_CONTROLLER_GROUPS = Object.freeze([
  {
    name: 'runtime',
    controllers: [blockState, renderState, coreApi, marktextApi]
  },
  {
    name: 'document',
    controllers: [paragraphCtrl, containerCtrl, htmlBlockCtrl, imageCtrl, linkCtrl, footnoteCtrl, tocCtrl, emojiCtrl]
  },
  {
    name: 'editing',
    controllers: [tabCtrl, enterCtrl, updateCtrl, backspaceCtrl, deleteCtrl, inputCtrl, formatCtrl, searchCtrl]
  },
  {
    name: 'clipboard',
    controllers: [pasteCtrl, copyCutCtrl]
  },
  {
    name: 'navigation',
    controllers: [arrowCtrl, clickCtrl]
  },
  {
    name: 'structure',
    controllers: [codeBlockCtrl, tableBlockCtrl, tableDragBarCtrl, tableSelectCellsCtrl, dragDropCtrl]
  }
])

export const CONTENT_STATE_CONTROLLERS = CONTENT_STATE_CONTROLLER_GROUPS.flatMap(group => group.controllers)

export const applyContentStateControllers = ContentState => {
  CONTENT_STATE_CONTROLLERS.forEach(ctrl => ctrl(ContentState))
}
