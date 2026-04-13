import { ALL_DOWNCODE_MAPS } from './urlifyMaps'

let downcoderMap = {}
let downcoderRegex = null

const escapeRegexCharacter = value => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

export const initializeDowncoder = () => {
  if (downcoderRegex) {
    return
  }

  downcoderMap = {}
  for (const lookup of ALL_DOWNCODE_MAPS) {
    Object.assign(downcoderMap, lookup)
  }
  downcoderRegex = new RegExp(Object.keys(downcoderMap).map(escapeRegexCharacter).join('|'), 'g')
}

export const applyDowncode = slug => {
  initializeDowncoder()
  return slug.replace(downcoderRegex, function (match) {
    return downcoderMap[match]
  })
}

export const normalizeSlug = input => {
  return applyDowncode(input)
    .toLowerCase()
    .trim()
    .replace(/[\u2000-\u206F\u2E00-\u2E7F\\'!"#$%&()*+,./:;<=>?@[\]^`{|}~]/g, '')
    .replace(/\s/g, '-')
}
