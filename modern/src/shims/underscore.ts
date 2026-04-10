import underscoreModule from 'underscore'

const underscore = (underscoreModule as typeof underscoreModule & { default?: typeof underscoreModule }).default ?? underscoreModule

export default underscore
