import execAllModule from 'execall'

const execAll = (execAllModule as typeof execAllModule & { default?: typeof execAllModule }).default ?? execAllModule

export default execAll
