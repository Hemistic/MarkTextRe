import { createBlockRules } from './blockRulesBaseSupport'
import { createGfmRules, createPedanticRules } from './blockRulesVariantSupport'

/* eslint-disable no-useless-escape */

export const block = createBlockRules()
export const normal = Object.assign({}, block)
export const gfm = createGfmRules(block)
export const pedantic = createPedanticRules(normal)

/* eslint-ensable no-useless-escape */
