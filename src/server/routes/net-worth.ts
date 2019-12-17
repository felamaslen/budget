import { Category, Subcategory, Entry } from '~/types/net-worth';
import { SocketWithAuth, ioRoute } from '~/server/modules/socket';
import {
  SpecificItem,
  getCategories,
  getSubcategories,
  getEntries,
} from '~/server/queries/net-worth';
import {
  NET_WORTH_CATEGORIES_READ,
  NET_WORTH_SUBCATEGORIES_READ,
  NET_WORTH_ENTRIES_READ,
} from '~/constants/actions.rt';

export default (socket: SocketWithAuth): void => {
  ioRoute<Category | readonly Category[], SpecificItem | undefined>(
    socket,
    NET_WORTH_CATEGORIES_READ,
    getCategories,
  );
  ioRoute<Subcategory | readonly Subcategory[], SpecificItem | undefined>(
    socket,
    NET_WORTH_SUBCATEGORIES_READ,
    getSubcategories,
  );
  ioRoute<Entry | readonly Entry[], SpecificItem | undefined>(
    socket,
    NET_WORTH_ENTRIES_READ,
    getEntries,
  );
};
