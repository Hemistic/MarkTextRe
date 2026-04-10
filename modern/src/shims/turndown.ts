import TurndownServiceModule from 'turndown'

const TurndownService = (TurndownServiceModule as typeof TurndownServiceModule & { default?: typeof TurndownServiceModule }).default ?? TurndownServiceModule

export default TurndownService
