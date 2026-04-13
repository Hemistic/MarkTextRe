import { FORMAT_MARKER_MAP } from '../config'

export const getOffset = (offset, { range: { start, end }, type, tag, anchor, alt }) => {
  const dis = offset - start
  const len = end - start
  switch (type) {
    case 'strong':
    case 'del':
    case 'em':
    case 'inline_code':
    case 'inline_math': {
      const markerLen = (type === 'strong' || type === 'del') ? 2 : 1
      if (dis < 0) return 0
      if (dis >= 0 && dis < markerLen) return -dis
      if (dis >= markerLen && dis <= len - markerLen) return -markerLen
      if (dis > len - markerLen && dis <= len) return len - dis - 2 * markerLen
      if (dis > len) return -2 * markerLen
      break
    }
    case 'html_tag': {
      const openMarkerLen = FORMAT_MARKER_MAP[tag].open.length
      const closeMarkerLen = FORMAT_MARKER_MAP[tag].close.length
      if (dis < 0) return 0
      if (dis >= 0 && dis < openMarkerLen) return -dis
      if (dis >= openMarkerLen && dis <= len - closeMarkerLen) return -openMarkerLen
      if (dis > len - closeMarkerLen && dis <= len) return len - dis - openMarkerLen - closeMarkerLen
      if (dis > len) return -openMarkerLen - closeMarkerLen
      break
    }
    case 'link': {
      const markerLen = 1
      if (dis < markerLen) return 0
      if (dis >= markerLen && dis <= markerLen + anchor.length) return -1
      if (dis > markerLen + anchor.length) return anchor.length - dis
      break
    }
    case 'image': {
      const markerLen = 1
      if (dis < markerLen) return 0
      if (dis >= markerLen && dis < markerLen * 2) return -1
      if (dis >= markerLen * 2 && dis <= markerLen * 2 + alt.length) return -2
      if (dis > markerLen * 2 + alt.length) return alt.length - dis
      break
    }
  }
}
