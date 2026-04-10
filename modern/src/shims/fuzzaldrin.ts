import fuzzaldrinModule from 'fuzzaldrin'

const fuzzaldrin = (fuzzaldrinModule as typeof fuzzaldrinModule & { default?: typeof fuzzaldrinModule }).default ?? fuzzaldrinModule

export const filter = (fuzzaldrin as { filter: typeof fuzzaldrin }).filter

export default fuzzaldrin
