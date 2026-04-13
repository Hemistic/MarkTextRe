import type { MuyaEditorConstructor } from './types'
import { pickImagePath } from '../../services/files'

import TablePicker from 'legacy-muya/lib/ui/tablePicker/index.js'
import QuickInsert from 'legacy-muya/lib/ui/quickInsert/index.js'
import CodePicker from 'legacy-muya/lib/ui/codePicker/index.js'
import EmojiPicker from 'legacy-muya/lib/ui/emojiPicker/index.js'
import ImagePathPicker from 'legacy-muya/lib/ui/imagePicker/index.js'
import ImageSelector from 'legacy-muya/lib/ui/imageSelector/index.js'
import Transformer from 'legacy-muya/lib/ui/transformer/index.js'
import ImageToolbar from 'legacy-muya/lib/ui/imageToolbar/index.js'
import FormatPicker from 'legacy-muya/lib/ui/formatPicker/index.js'
import LinkTools from 'legacy-muya/lib/ui/linkTools/index.js'
import FootnoteTool from 'legacy-muya/lib/ui/footnoteTool/index.js'
import TableBarTools from 'legacy-muya/lib/ui/tableTools/index.js'
import FrontMenu from 'legacy-muya/lib/ui/frontMenu/index.js'

let hasRegisteredMuyaPlugins = false

export const registerMuyaPlugins = (Muya: MuyaEditorConstructor) => {
  if (hasRegisteredMuyaPlugins) {
    return
  }

  Muya.use(TablePicker)
  Muya.use(QuickInsert)
  Muya.use(CodePicker)
  Muya.use(EmojiPicker)
  Muya.use(ImagePathPicker)
  Muya.use(ImageSelector, {
    imagePathPicker: pickImagePath
  })
  Muya.use(Transformer)
  Muya.use(ImageToolbar)
  Muya.use(FormatPicker)
  Muya.use(FrontMenu)
  Muya.use(LinkTools, {
    jumpClick: (href: string) => {
      if (typeof window !== 'undefined') {
        window.open(href, '_blank', 'noopener')
      }
    }
  })
  Muya.use(FootnoteTool)
  Muya.use(TableBarTools)

  hasRegisteredMuyaPlugins = true
}
