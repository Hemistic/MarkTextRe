import { registerBlockBasicApi } from './blockBasicApiSupport'
import { registerBlockTreeApi } from './blockTreeApiSupport'
import { registerBlockMutationApi } from './blockMutationApiSupport'

const blockState = ContentState => {
  registerBlockBasicApi(ContentState)
  registerBlockTreeApi(ContentState)
  registerBlockMutationApi(ContentState)
}

export default blockState
