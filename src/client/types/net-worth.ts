import type { NativeDate } from './crud';
import type {
  CreditLimit,
  Currency,
  InitialQuery,
  NetWorthEntryInput,
  NetWorthValueInput,
  NetWorthValueObject,
} from './gql';
import type { GQL } from './shared';

export type NetWorthTableRow = {
  id: number;
  date: Date;
  assets: number;
  options: number;
  liabilities: number;
  aggregate: AggregateSums;
  expenses: number;
  fti: number;
  pastYearAverageSpend: number;
};

export type NetWorthTableColumn = 'date' | 'assets' | 'liabilities' | 'main' | 'expenses';

export enum Aggregate {
  cashEasyAccess = 'Cash (easy access)',
  cashOther = 'Cash (other)',
  stocks = 'Stocks', // this is actually stock+cash investments
  pension = 'Pension',
  realEstate = 'House',
  mortgage = 'Mortgage',
}

export type AggregateSums = {
  [key in Aggregate]: number;
};

export type NetWorthEntryRead = NonNullable<InitialQuery['netWorthEntries']>['current'][0];
export type NetWorthValueObjectRead = NetWorthEntryRead['values'][0];

export type NetWorthValueObjectNative = Omit<
  GQL<NonNullable<NetWorthValueObjectRead>>,
  'fx' | 'option' | 'mortgage'
> & {
  fx?: GQL<NonNullable<NetWorthValueObjectRead['fx']>[0]>[] | null;
  option?: GQL<NonNullable<NetWorthValueObjectRead['option']>> | null;
  mortgage?: GQL<NonNullable<NetWorthValueObjectRead['mortgage']>> | null;
};

export type NetWorthEntryNative = Pick<NativeDate<NetWorthEntryRead, 'date'>, 'id' | 'date'> & {
  values: GQL<NetWorthValueObjectNative>[];
  creditLimit: GQL<CreditLimit>[];
  currencies: GQL<Currency>[];
};

export type NetWorthEntryInputNative = NativeDate<NetWorthEntryInput, 'date'>;

export type NetWorthValue = NetWorthValueInput | NetWorthValueObject;
