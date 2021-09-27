import type { ListItemInput, ListSubscription, Maybe } from './gql';
import type { Create, RawDate } from '~shared/types';

export type TypeMap<I extends ListItemInput> = Record<keyof Create<I>, string>;

export type ColumnMap<I extends Record<string, unknown>> = { [key: string]: keyof I };

export type ListSubscriptionRawDate = Omit<ListSubscription, 'created' | 'updated'> & {
  created?: Maybe<
    Omit<NonNullable<ListSubscription['created']>, 'item'> & {
      item: RawDate<NonNullable<Required<ListSubscription>['created']>['item'], 'date'>;
    }
  >;
  updated?: Maybe<RawDate<ListSubscription['updated'], 'date'>>;
};
