import shortid from 'shortid';

import * as actions from '~client/constants/actions/list';

export const listItemCreated = (page, item) => ({
    type: actions.LIST_ITEM_CREATED,
    page,
    item,
    fakeId: shortid.generate()
});

export const listItemUpdated = (page, id, item, oldItem) => ({
    page,
    type: actions.LIST_ITEM_UPDATED,
    id,
    item,
    oldItem
});

export const listItemDeleted = (id, { page }, oldItem) => ({
    page,
    type: actions.LIST_ITEM_DELETED,
    id,
    oldItem
});
