import { SocketAction } from '~/actions/types';
import {
  NET_WORTH_CATEGORIES_READ,
  NET_WORTH_SUBCATEGORIES_READ,
  NET_WORTH_ENTRIES_READ,
} from '~/constants/actions.rt';

export const netWorthCategoriesRead = (): SocketAction => ({
  type: NET_WORTH_CATEGORIES_READ,
  __FROM_SOCKET__: false,
});

export const netWorthSubcategoriesRead = (): SocketAction => ({
  type: NET_WORTH_SUBCATEGORIES_READ,
  __FROM_SOCKET__: false,
});

export const netWorthEntriesRead = (): SocketAction => ({
  type: NET_WORTH_ENTRIES_READ,
  __FROM_SOCKET__: false,
});
