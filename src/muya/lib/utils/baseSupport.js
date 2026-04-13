export const isMetaKey = ({ key }) => key === 'Shift' || key === 'Control' || key === 'Alt' || key === 'Meta'

export const noop = () => {}

export const identity = i => i

export const isOdd = number => Math.abs(number) % 2 === 1

export const isEven = number => Math.abs(number) % 2 === 0

export const isLengthEven = (str = '') => str.length % 2 === 0

export const snakeToCamel = name => name.replace(/_([a-z])/g, (p0, p1) => p1.toUpperCase())

export const camelToSnake = name => name.replace(/([A-Z])/g, (_, p) => `-${p.toLowerCase()}`)

export const conflict = (arr1, arr2) => {
  return !(arr1[1] < arr2[0] || arr2[1] < arr1[0])
}

export const union = ({ start: tStart, end: tEnd }, { start: lStart, end: lEnd, active }) => {
  if (!(tEnd <= lStart || lEnd <= tStart)) {
    if (lStart < tStart) {
      return {
        start: tStart,
        end: tEnd < lEnd ? tEnd : lEnd,
        active
      }
    } else {
      return {
        start: lStart,
        end: tEnd < lEnd ? tEnd : lEnd,
        active
      }
    }
  }
  return null
}

export const throttle = (func, wait = 50) => {
  let context
  let args
  let result
  let timeout = null
  let previous = 0
  const later = () => {
    previous = Date.now()
    timeout = null
    result = func.apply(context, args)
    if (!timeout) {
      context = args = null
    }
  }

  return function () {
    const now = Date.now()
    const remaining = wait - (now - previous)

    context = this
    args = arguments
    if (remaining <= 0 || remaining > wait) {
      if (timeout) {
        clearTimeout(timeout)
        timeout = null
      }
      previous = now
      result = func.apply(context, args)
      if (!timeout) {
        context = args = null
      }
    } else if (!timeout) {
      timeout = setTimeout(later, remaining)
    }
    return result
  }
}

export const debounce = (func, wait = 50) => {
  let timer = null
  return function (...args) {
    if (timer) clearTimeout(timer)
    timer = setTimeout(() => {
      func(...args)
    }, wait)
  }
}

export const deepCopyArray = array => {
  const result = []
  const len = array.length
  for (let i = 0; i < len; i++) {
    if (typeof array[i] === 'object' && array[i] !== null) {
      if (Array.isArray(array[i])) {
        result.push(deepCopyArray(array[i]))
      } else {
        result.push(deepCopy(array[i]))
      }
    } else {
      result.push(array[i])
    }
  }
  return result
}

export const deepCopy = object => {
  const obj = {}
  Object.keys(object).forEach(key => {
    if (typeof object[key] === 'object' && object[key] !== null) {
      if (Array.isArray(object[key])) {
        obj[key] = deepCopyArray(object[key])
      } else {
        obj[key] = deepCopy(object[key])
      }
    } else {
      obj[key] = object[key]
    }
  })
  return obj
}

export const wordCount = markdown => {
  const paragraph = markdown.split(/\n{2,}/).filter(line => line).length
  let word = 0
  let character = 0
  let all = 0

  const removedChinese = markdown.replace(/[\u4e00-\u9fa5]/g, '')
  const tokens = removedChinese.split(/[\s\n]+/).filter(t => t)
  const chineseWordLength = markdown.length - removedChinese.length
  word += chineseWordLength + tokens.length
  character += tokens.reduce((acc, t) => acc + t.length, 0) + chineseWordLength
  all += markdown.length

  return { word, paragraph, character, all }
}

export const mixins = (constructor, ...object) => {
  return Object.assign(constructor.prototype, ...object)
}

export const getParagraphReference = (ele, id) => {
  const { x, y, left, top, bottom, height } = ele.getBoundingClientRect()
  return {
    getBoundingClientRect () {
      return { x, y, left, top, bottom, height, width: 0, right: left }
    },
    clientWidth: 0,
    clientHeight: height,
    id
  }
}

export const verticalPositionInRect = (event, rect) => {
  const { clientY } = event
  const { top, height } = rect
  return (clientY - top) > (height / 2) ? 'down' : 'up'
}

export const collectFootnotes = blocks => {
  const map = new Map()
  for (const block of blocks) {
    if (block.type === 'figure' && block.functionType === 'footnote') {
      const identifier = block.children[0].text
      map.set(identifier, block)
    }
  }

  return map
}

export const getDefer = () => {
  const defer = {}
  const promise = new Promise((resolve, reject) => {
    defer.resolve = resolve
    defer.reject = reject
  })
  defer.promise = promise

  return defer
}

export const deepClone = obj => {
  return JSON.parse(JSON.stringify(obj))
}
