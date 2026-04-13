// @ts-expect-error DOMPurify ESM bundle has no local type declaration on this path.
import DOMPurify from '../../node_modules/dompurify/dist/purify.es.js'

export const sanitize = DOMPurify.sanitize.bind(DOMPurify)
export const isValidAttribute = DOMPurify.isValidAttribute.bind(DOMPurify)

export default sanitize
