import { State } from '~client/reducers/crud';
import { RequestType, Item } from '~client/types';

export const withoutDeleted = <I extends Item>(state: State<I>): I[] =>
  state.items.filter((_, index) => state.__optimistic[index] !== RequestType.delete);
