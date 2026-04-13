import { registerBlockTreeRelationApi } from './blockTreeRelationApiSupport'
import { registerBlockTreeTraversalApi } from './blockTreeTraversalApiSupport'

export const registerBlockTreeApi = ContentState => {
  registerBlockTreeRelationApi(ContentState)
  registerBlockTreeTraversalApi(ContentState)
}
