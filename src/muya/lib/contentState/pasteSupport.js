import { PREVIEW_DOMPURIFY_CONFIG, IMAGE_EXT_REG, URL_REG } from '../config'
import { sanitize, getUniqueId, getImageInfo as getImageSrc, getPageTitle } from '../utils'
import { getImageInfo } from '../utils/getImageInfo'

export const standardizeHTML = async (contentState, rawHtml) => {
  if (/<body>[\s\S]*<\/body>/.test(rawHtml)) {
    const match = /<body>([\s\S]*)<\/body>/.exec(rawHtml)
    if (match && typeof match[1] === 'string') {
      rawHtml = match[1]
    }
  }

  const sanitizedHtml = sanitize(rawHtml, PREVIEW_DOMPURIFY_CONFIG, false)
  const tempWrapper = document.createElement('div')
  tempWrapper.innerHTML = sanitizedHtml

  const tables = Array.from(tempWrapper.querySelectorAll('table'))
  for (const table of tables) {
    const row = table.querySelector('tr')
    if (row.firstElementChild.tagName !== 'TH') {
      [...row.children].forEach(cell => {
        const th = document.createElement('th')
        th.innerHTML = cell.innerHTML
        cell.replaceWith(th)
      })
    }
    const paragraphs = Array.from(table.querySelectorAll('p'))
    for (const p of paragraphs) {
      const span = document.createElement('span')
      span.innerHTML = p.innerHTML
      p.replaceWith(span)
    }

    const tds = table.querySelectorAll('td')
    for (const td of tds) {
      const tableDataHtml = td.innerHTML
      if (/<br>/.test(tableDataHtml)) {
        td.innerHTML = tableDataHtml.replace(/<br>/g, '&lt;br&gt;')
      }
    }
  }

  const links = Array.from(tempWrapper.querySelectorAll('a'))
  for (const link of links) {
    const href = link.getAttribute('href')
    const text = link.textContent
    if (URL_REG.test(href) && href === text) {
      const title = await getPageTitle(href)
      if (title) {
        link.innerHTML = sanitize(title, PREVIEW_DOMPURIFY_CONFIG, true)
      } else {
        const span = document.createElement('span')
        span.innerHTML = text
        link.replaceWith(span)
      }
    }
  }

  return tempWrapper.innerHTML
}

const replacePendingImage = (contentState, alt, src) => {
  if (contentState.selectedImage) {
    contentState.replaceImage(contentState.selectedImage, { alt, src })
  } else {
    contentState.insertImage({ alt, src })
  }
}

const applyResolvedImage = (contentState, id, src) => {
  const imageWrapper = contentState.muya.container.querySelector(`span[data-id=${id}]`)
  if (imageWrapper) {
    const imageInfo = getImageInfo(imageWrapper)
    contentState.replaceImage(imageInfo, { src })
  }
}

const pasteImageFromPath = async (contentState, imagePath) => {
  const id = `loading-${getUniqueId()}`
  replacePendingImage(contentState, id, imagePath)

  let newSrc = null
  try {
    newSrc = await contentState.muya.options.imageAction(imagePath, id)
  } catch (error) {
    console.error('Unexpected error on image action:', error)
    return null
  }

  const { src } = getImageSrc(imagePath)
  if (src) {
    contentState.stateRender.urlMap.set(newSrc, src)
  }

  applyResolvedImage(contentState, id, newSrc)
  return imagePath
}

const pasteImageFromFile = async (contentState, file) => {
  const id = `loading-${getUniqueId()}`
  replacePendingImage(contentState, id, '')

  const reader = new FileReader()
  reader.onload = event => {
    const base64 = event.target.result
    const imageWrapper = contentState.muya.container.querySelector(`span[data-id=${id}]`)
    const imageContainer = contentState.muya.container.querySelector(`span[data-id=${id}] .ag-image-container`)
    contentState.stateRender.urlMap.set(id, base64)
    if (imageContainer) {
      imageWrapper.classList.remove('ag-empty-image')
      imageWrapper.classList.add('ag-image-success')
      const image = document.createElement('img')
      image.src = base64
      imageContainer.appendChild(image)
    }
  }
  reader.readAsDataURL(file)

  let newSrc = null
  try {
    newSrc = await contentState.muya.options.imageAction(file, id)
  } catch (error) {
    console.error('Unexpected error on image action:', error)
    return null
  }

  const base64 = contentState.stateRender.urlMap.get(id)
  if (base64) {
    contentState.stateRender.urlMap.set(newSrc, base64)
    contentState.stateRender.urlMap.delete(id)
  }

  applyResolvedImage(contentState, id, newSrc)
  return file
}

export const pasteImage = async (contentState, event) => {
  const imagePath = contentState.muya.options.clipboardFilePath()
  if (imagePath && typeof imagePath === 'string' && IMAGE_EXT_REG.test(imagePath)) {
    return pasteImageFromPath(contentState, imagePath)
  }

  const items = event.clipboardData && event.clipboardData.items
  let file = null
  if (items && items.length) {
    for (let i = 0; i < items.length; i++) {
      if (items[i].type.indexOf('image') !== -1) {
        file = items[i].getAsFile()
        break
      }
    }
  }

  if (file) {
    return pasteImageFromFile(contentState, file)
  }

  return null
}
