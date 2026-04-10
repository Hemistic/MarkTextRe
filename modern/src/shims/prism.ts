import PrismModule from 'prismjs'

const Prism = (PrismModule as typeof PrismModule & { default?: typeof PrismModule }).default ?? PrismModule

export default Prism
