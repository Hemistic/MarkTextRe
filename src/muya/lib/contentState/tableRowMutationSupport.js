import { insertRow } from './tableRowInsertSupport'
import { removeRow } from './tableRowRemoveSupport'

export const editTableRow = (contentState, context, action, location) => {
  return action === 'insert'
    ? insertRow(contentState, context, location)
    : removeRow(contentState, context, location)
}
