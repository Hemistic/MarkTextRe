import * as componentsModule from 'prismjs/components.js'

const components = (componentsModule as typeof componentsModule & { default?: unknown }).default ?? componentsModule

export const languages = (components as { languages?: unknown }).languages

export default components
