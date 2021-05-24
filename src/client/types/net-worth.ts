import type {
  CreditLimit,
  Currency,
  InitialQuery,
  NetWorthCashTotal,
  NetWorthEntryInput,
  NetWorthValueInput,
  NetWorthValueObject,
} from './gql';
import type { NetWorthAggregate } from '~shared/constants';
import type { GQL, NativeDate } from '~shared/types';

export type NetWorthTableRow = {
  id: number;
  date: Date;
  assets: number;
  options: number;
  liabilities: number;
  aggregate: NetWorthAggregateSums;
  expenses: number;
  fti: number;
  pastYearAverageSpend: number;
};

export type NetWorthTableColumn = 'date' | 'assets' | 'liabilities' | 'main' | 'expenses';

export type NetWorthAggregateSums = {
  [key in NetWorthAggregate]: number;
};

export type NetWorthEntryRead = NonNullable<InitialQuery['netWorthEntries']>['current'][0];
export type NetWorthValueObjectRead = NetWorthEntryRead['values'][0];

export type NetWorthValueObjectNative = Omit<
  GQL<NonNullable<NetWorthValueObjectRead>>,
  'fx' | 'option' | 'loan'
> & {
  fx?: GQL<NonNullable<NetWorthValueObjectRead['fx']>[0]>[] | null;
  option?: GQL<NonNullable<NetWorthValueObjectRead['option']>> | null;
  loan?: GQL<NonNullable<NetWorthValueObjectRead['loan']>> | null;
};

export type NetWorthEntryNative = Pick<NativeDate<NetWorthEntryRead, 'date'>, 'id' | 'date'> & {
  values: GQL<NetWorthValueObjectNative>[];
  creditLimit: GQL<CreditLimit>[];
  currencies: GQL<Currency>[];
};

export type NetWorthEntryInputNative = NativeDate<NetWorthEntryInput, 'date'>;

export type NetWorthValue = NetWorthValueInput | NetWorthValueObject;

export type CashTotalNative = Omit<GQL<NetWorthCashTotal>, 'date'> & {
  date: Date | null;
};
