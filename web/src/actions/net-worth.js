import shortid from 'shortid';

import * as actions from '~client/constants/actions/net-worth';

export const netWorthCategoryCreated = (item) => ({
    type: actions.NET_WORTH_CATEGORY_CREATED,
    fakeId: shortid.generate(),
    item,
});
export const netWorthCategoryUpdated = (id, item) => ({ type: actions.NET_WORTH_CATEGORY_UPDATED, id, item });
export const netWorthCategoryDeleted = (id) => ({ type: actions.NET_WORTH_CATEGORY_DELETED, id });

export const netWorthSubcategoryCreated = (item) => ({
    type: actions.NET_WORTH_SUBCATEGORY_CREATED,
    fakeId: shortid.generate(),
    item,
});
export const netWorthSubcategoryUpdated = (id, item) => ({ type: actions.NET_WORTH_SUBCATEGORY_UPDATED, id, item });
export const netWorthSubcategoryDeleted = (id) => ({ type: actions.NET_WORTH_SUBCATEGORY_DELETED, id });

export const netWorthCreated = (item) => ({
    type: actions.NET_WORTH_CREATED,
    fakeId: shortid.generate(),
    item,
});
export const netWorthUpdated = (id, item) => ({ type: actions.NET_WORTH_UPDATED, id, item });
export const netWorthDeleted = (id) => ({ type: actions.NET_WORTH_DELETED, id });
