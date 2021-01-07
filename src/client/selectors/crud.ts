import { State } from '~client/reducers/crud';
import type { Item } from '~client/types';
import { RequestType } from '~client/types/enum';

export const withoutDeleted = <I extends Item>(state: State<I>): I[] =>
  state.items.filter((_, index) => state.__optimistic[index] !== RequestType.delete);
