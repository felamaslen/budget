import * as actions from '~client/constants/actions/list';

export const listItemCreated = req => ({ type: actions.LIST_ITEM_CREATED, req });
export const listItemUpdated = req => ({ type: actions.LIST_ITEM_UPDATED, req });
export const listItemDeleted = id => ({ type: actions.LIST_ITEM_DELETED, id });
