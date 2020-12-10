import { getReceiptCategories, getSuggestions, getReceiptItem } from '~api/controllers';
import { genericAuthDbResolver } from '~api/modules/crud';
import { Resolvers } from '~api/types';

export const searchResolvers: Resolvers = {
  Query: {
    search: genericAuthDbResolver(getSuggestions),

    receiptItem: genericAuthDbResolver(getReceiptItem),

    receiptItems: genericAuthDbResolver(getReceiptCategories),
  },
};
