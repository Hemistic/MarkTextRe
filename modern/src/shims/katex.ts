import katexModule from 'katex'

const katex = (katexModule as typeof katexModule & { default?: typeof katexModule }).default ?? katexModule

export default katex
