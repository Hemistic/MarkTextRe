import { URL_REG, DATA_URL_REG } from '../config'
import { correctImageSrc } from '../utils/getImageInfo'

export const encodeImageSource = src => {
  if (URL_REG.test(src)) {
    return encodeURI(src)
  } else if (DATA_URL_REG.test(src)) {
    return src
  }
  return src.replace(/ /g, encodeURI(' ')).replace(/#/g, encodeURIComponent('#'))
}

export const buildHtmlImageTag = attrs => {
  let imageText = '<img '
  for (const attr of Object.keys(attrs)) {
    let value = attrs[attr]
    if (value && attr === 'src') {
      value = correctImageSrc(value)
    }
    imageText += `${attr}="${value}" `
  }
  imageText = imageText.trim()
  imageText += '>'
  return imageText
}
