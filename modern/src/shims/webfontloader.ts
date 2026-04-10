import WebFontModule from 'webfontloader'

const WebFont = (WebFontModule as typeof WebFontModule & { default?: typeof WebFontModule }).default ?? WebFontModule

export default WebFont
