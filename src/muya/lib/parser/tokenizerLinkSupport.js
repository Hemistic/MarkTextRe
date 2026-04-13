import { isLengthEven } from '../utils'
import { parseSrcAndTitle } from './htmlSupport'
import { correctUrl } from './tokenizerRuleSupport'

const createRange = (pos, raw) => ({
  start: pos,
  end: pos + raw.length
})

export const consumeLinkToken = ({
  src,
  pos,
  labels,
  tokens,
  pushPending,
  inlineRules,
  validateRules,
  options,
  tokenizerFac
}) => {
  const imageTo = inlineRules.image.exec(src)
  correctUrl(imageTo)
  if (imageTo && isLengthEven(imageTo[3]) && isLengthEven(imageTo[5])) {
    const { src: imageSrc, title } = parseSrcAndTitle(imageTo[4])
    pushPending()
    tokens.push({
      type: 'image',
      raw: imageTo[0],
      marker: imageTo[1],
      srcAndTitle: imageTo[4],
      attrs: {
        src: imageSrc + encodeURI(imageTo[5]),
        title,
        alt: imageTo[2] + encodeURI(imageTo[3])
      },
      src: imageSrc,
      title,
      parent: tokens,
      range: createRange(pos, imageTo[0]),
      alt: imageTo[2],
      backlash: {
        first: imageTo[3],
        second: imageTo[5]
      }
    })

    return {
      consumed: true,
      nextSrc: src.substring(imageTo[0].length),
      nextPos: pos + imageTo[0].length
    }
  }

  const linkTo = inlineRules.link.exec(src)
  correctUrl(linkTo)
  if (linkTo && isLengthEven(linkTo[3]) && isLengthEven(linkTo[5])) {
    const { src: href, title } = parseSrcAndTitle(linkTo[4])
    pushPending()
    tokens.push({
      type: 'link',
      raw: linkTo[0],
      marker: linkTo[1],
      hrefAndTitle: linkTo[4],
      href,
      title,
      parent: tokens,
      anchor: linkTo[2],
      range: createRange(pos, linkTo[0]),
      children: tokenizerFac(linkTo[2], undefined, inlineRules, validateRules, pos + linkTo[1].length, false, labels, options),
      backlash: {
        first: linkTo[3],
        second: linkTo[5]
      }
    })

    return {
      consumed: true,
      nextSrc: src.substring(linkTo[0].length),
      nextPos: pos + linkTo[0].length
    }
  }

  const rLinkTo = inlineRules.reference_link.exec(src)
  if (rLinkTo && labels.has(rLinkTo[3] || rLinkTo[1]) && isLengthEven(rLinkTo[2]) && isLengthEven(rLinkTo[4])) {
    pushPending()
    tokens.push({
      type: 'reference_link',
      raw: rLinkTo[0],
      isFullLink: !!rLinkTo[3],
      parent: tokens,
      anchor: rLinkTo[1],
      backlash: {
        first: rLinkTo[2],
        second: rLinkTo[4] || ''
      },
      label: rLinkTo[3] || rLinkTo[1],
      range: createRange(pos, rLinkTo[0]),
      children: tokenizerFac(rLinkTo[1], undefined, inlineRules, validateRules, pos + 1, false, labels, options)
    })

    return {
      consumed: true,
      nextSrc: src.substring(rLinkTo[0].length),
      nextPos: pos + rLinkTo[0].length
    }
  }

  const rImageTo = inlineRules.reference_image.exec(src)
  if (rImageTo && labels.has(rImageTo[3] || rImageTo[1]) && isLengthEven(rImageTo[2]) && isLengthEven(rImageTo[4])) {
    pushPending()
    tokens.push({
      type: 'reference_image',
      raw: rImageTo[0],
      isFullLink: !!rImageTo[3],
      parent: tokens,
      alt: rImageTo[1],
      backlash: {
        first: rImageTo[2],
        second: rImageTo[4] || ''
      },
      label: rImageTo[3] || rImageTo[1],
      range: createRange(pos, rImageTo[0])
    })

    return {
      consumed: true,
      nextSrc: src.substring(rImageTo[0].length),
      nextPos: pos + rImageTo[0].length
    }
  }

  return {
    consumed: false,
    nextSrc: src,
    nextPos: pos
  }
}
