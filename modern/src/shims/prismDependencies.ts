import getLoaderModule from 'prismjs/dependencies'

const getLoader = (getLoaderModule as typeof getLoaderModule & { default?: typeof getLoaderModule }).default ?? getLoaderModule

export default getLoader
