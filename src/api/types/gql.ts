import { GraphQLResolveInfo, GraphQLScalarType, GraphQLScalarTypeConfig } from 'graphql';
import { Context } from '~api/types/resolver';
export type Maybe<T> = T | null;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type RequireFields<T, K extends keyof T> = { [X in Exclude<keyof T, K>]?: T[X] } & { [P in K]-?: NonNullable<T[P]> };
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: string;
  String: string;
  Boolean: boolean;
  Int: number;
  Float: number;
  Date: Date;
  DateTime: Date;
  NonNegativeFloat: number;
  NonNegativeInt: number;
  PositiveInt: number;
};

export enum AnalysisGroupBy {
  Category = 'category',
  Shop = 'shop'
}

export enum AnalysisPage {
  Income = 'income',
  Bills = 'bills',
  Food = 'food',
  General = 'general',
  Holiday = 'holiday',
  Social = 'social'
}

export enum AnalysisPeriod {
  Year = 'year',
  Month = 'month',
  Week = 'week'
}

export type AnalysisResponse = {
  cost: Array<CategoryCostTree>;
  description: Scalars['String'];
  startDate: Scalars['Date'];
  endDate: Scalars['Date'];
};

export type AppConfig = {
  birthDate: Scalars['String'];
  futureMonths: Scalars['Int'];
  realTimePrices: Scalars['Boolean'];
  fundMode?: Maybe<FundMode>;
  fundPeriod?: Maybe<FundPeriod>;
  fundLength?: Maybe<Scalars['NonNegativeInt']>;
};

export type AppConfigInput = {
  birthDate?: Maybe<Scalars['Date']>;
  futureMonths?: Maybe<Scalars['Int']>;
  realTimePrices?: Maybe<Scalars['Boolean']>;
  fundMode?: Maybe<FundMode>;
  fundPeriod?: Maybe<FundPeriod>;
  fundLength?: Maybe<Scalars['NonNegativeInt']>;
};

export type AppConfigSet = {
  config?: Maybe<AppConfig>;
  error?: Maybe<Scalars['String']>;
};

export type Bucket = {
  id: Scalars['NonNegativeInt'];
  page: AnalysisPage;
  filterCategory?: Maybe<Scalars['String']>;
  expectedValue: Scalars['NonNegativeInt'];
  actualValue: Scalars['NonNegativeInt'];
};

export type BucketInput = {
  page: AnalysisPage;
  filterCategory?: Maybe<Scalars['String']>;
  value: Scalars['NonNegativeInt'];
};

export type CategoryCostTree = {
  item: AnalysisPage;
  tree: Array<CategoryTreeItem>;
};

export type CategoryCostTreeDeep = {
  item: Scalars['String'];
  tree: Array<CategoryTreeItem>;
};

export type CategoryTreeItem = {
  category: Scalars['String'];
  sum: Scalars['Int'];
};

export type CreditLimit = {
  subcategory: Scalars['Int'];
  value: Scalars['Int'];
};

export type CreditLimitInput = {
  subcategory: Scalars['Int'];
  value: Scalars['Int'];
};

export type CrudResponseCreate = {
  error?: Maybe<Scalars['String']>;
  id?: Maybe<Scalars['Int']>;
};

export type CrudResponseDelete = {
  error?: Maybe<Scalars['String']>;
};

export type CrudResponseUpdate = {
  error?: Maybe<Scalars['String']>;
};

export type Currency = {
  currency: Scalars['String'];
  rate: Scalars['NonNegativeFloat'];
};

export type CurrencyInput = {
  currency: Scalars['String'];
  rate: Scalars['NonNegativeFloat'];
};



export type ExchangeRate = {
  currency: Scalars['String'];
  rate: Scalars['NonNegativeFloat'];
};

export type ExchangeRatesResponse = {
  error?: Maybe<Scalars['String']>;
  rates?: Maybe<Array<ExchangeRate>>;
};

export type FxValue = {
  value: Scalars['Float'];
  currency: Scalars['String'];
};

export type FxValueInput = {
  value: Scalars['Float'];
  currency: Scalars['String'];
};

export type Fund = {
  id: Scalars['Int'];
  item: Scalars['String'];
  transactions: Array<Transaction>;
  allocationTarget?: Maybe<Scalars['NonNegativeInt']>;
  stockSplits: Array<StockSplit>;
};

export type FundCreateUpdate = {
  id: Scalars['Int'];
  fakeId?: Maybe<Scalars['Int']>;
  item: FundData;
  overviewCost: Array<Scalars['Int']>;
};

export type FundData = {
  item: Scalars['String'];
  transactions: Array<Transaction>;
  stockSplits: Array<StockSplit>;
  allocationTarget?: Maybe<Scalars['NonNegativeInt']>;
};

export type FundDelete = {
  id: Scalars['Int'];
  overviewCost: Array<Scalars['Int']>;
};

export type FundHistory = {
  startTime: Scalars['Int'];
  cacheTimes: Array<Scalars['Int']>;
  prices: Array<FundPrices>;
  annualisedFundReturns: Scalars['Float'];
  overviewCost: Array<Scalars['Int']>;
};

export type FundHistoryIndividual = {
  values: Array<FundValueIndividual>;
};

export type FundInput = {
  item: Scalars['String'];
  transactions: Array<TransactionInput>;
  allocationTarget?: Maybe<Scalars['NonNegativeInt']>;
  stockSplits?: Maybe<Array<StockSplitInput>>;
};

export enum FundMode {
  Roi = 'ROI',
  Value = 'Value',
  Stacked = 'Stacked',
  Price = 'Price',
  PriceNormalised = 'PriceNormalised'
}

export enum FundPeriod {
  Year = 'year',
  Month = 'month',
  Ytd = 'ytd'
}

export type FundPriceGroup = {
  startIndex: Scalars['Int'];
  values: Array<Scalars['NonNegativeFloat']>;
};

export type FundPrices = {
  fundId: Scalars['Int'];
  groups: Array<FundPriceGroup>;
};

export type FundValueIndividual = {
  date: Scalars['Int'];
  price: Scalars['NonNegativeFloat'];
};

export type InitialCumulativeValues = {
  income: Scalars['Int'];
  spending: Scalars['Int'];
};

export type InvestmentBucket = {
  expectedValue: Scalars['NonNegativeInt'];
  purchaseValue: Scalars['NonNegativeInt'];
};

export type InvestmentBucketInput = {
  value: Scalars['NonNegativeInt'];
};

export type ListBucketsResponse = {
  error?: Maybe<Scalars['String']>;
  buckets?: Maybe<Array<Bucket>>;
  investmentBucket?: Maybe<InvestmentBucket>;
};

export type ListItem = {
  id: Scalars['Int'];
  item: Scalars['String'];
};

export type ListItemCreateUpdate = {
  page: PageListStandard;
  id: Scalars['Int'];
  fakeId?: Maybe<Scalars['Int']>;
  item: ListItemStandardSubscription;
  overviewCost: Array<Scalars['Int']>;
  total?: Maybe<Scalars['Int']>;
  weekly?: Maybe<Scalars['Int']>;
};

export type ListItemDelete = {
  page: PageListStandard;
  id: Scalars['Int'];
  overviewCost: Array<Scalars['Int']>;
  total?: Maybe<Scalars['Int']>;
  weekly?: Maybe<Scalars['Int']>;
};

export type ListItemInput = {
  fakeId?: Maybe<Scalars['Int']>;
  item: Scalars['String'];
};

export type ListItemStandard = {
  id: Scalars['Int'];
  date: Scalars['Date'];
  item: Scalars['String'];
  category: Scalars['String'];
  cost: Scalars['Int'];
  shop: Scalars['String'];
};

export type ListItemStandardInput = {
  date: Scalars['String'];
  item: Scalars['String'];
  cost: Scalars['Int'];
  category: Scalars['String'];
  shop: Scalars['String'];
};

export type ListItemStandardSubscription = {
  date: Scalars['Date'];
  item: Scalars['String'];
  category: Scalars['String'];
  cost: Scalars['Int'];
  shop: Scalars['String'];
};

export type ListReadResponse = {
  error?: Maybe<Scalars['String']>;
  items: Array<ListItemStandard>;
  olderExists?: Maybe<Scalars['Boolean']>;
  weekly?: Maybe<Scalars['Int']>;
  total?: Maybe<Scalars['Int']>;
};

export type ListTotalsResponse = {
  error?: Maybe<Scalars['String']>;
  total?: Maybe<Scalars['Int']>;
  weekly?: Maybe<Scalars['Int']>;
};

export type LoanValue = {
  principal: Scalars['NonNegativeInt'];
  paymentsRemaining: Scalars['NonNegativeInt'];
  rate: Scalars['Float'];
};

export type LoanValueInput = {
  principal: Scalars['NonNegativeInt'];
  paymentsRemaining: Scalars['NonNegativeInt'];
  rate: Scalars['Float'];
};

export type LoginResponse = {
  error?: Maybe<Scalars['String']>;
  uid?: Maybe<Scalars['Int']>;
  name?: Maybe<Scalars['String']>;
  apiKey?: Maybe<Scalars['String']>;
  expires?: Maybe<Scalars['DateTime']>;
};

export type LogoutResponse = {
  error?: Maybe<Scalars['String']>;
  ok?: Maybe<Scalars['Boolean']>;
};

export type Monthly = {
  investmentPurchases: Array<Scalars['Int']>;
  income: Array<Scalars['Int']>;
  bills: Array<Scalars['Int']>;
  food: Array<Scalars['Int']>;
  general: Array<Scalars['Int']>;
  holiday: Array<Scalars['Int']>;
  social: Array<Scalars['Int']>;
};

export enum MonthlyCategory {
  Stocks = 'stocks',
  Income = 'income',
  Spending = 'spending',
  Bills = 'bills',
  Food = 'food',
  General = 'general',
  Holiday = 'holiday',
  Social = 'social'
}

export type Mutation = {
  createFund?: Maybe<CrudResponseCreate>;
  createListItem?: Maybe<CrudResponseCreate>;
  createNetWorthCategory?: Maybe<CrudResponseCreate>;
  createNetWorthEntry?: Maybe<CrudResponseCreate>;
  createNetWorthSubcategory?: Maybe<CrudResponseCreate>;
  createReceipt?: Maybe<ReceiptCreated>;
  deleteFund?: Maybe<CrudResponseDelete>;
  deleteListItem?: Maybe<CrudResponseDelete>;
  deleteNetWorthCategory?: Maybe<CrudResponseDelete>;
  deleteNetWorthEntry?: Maybe<CrudResponseDelete>;
  deleteNetWorthSubcategory?: Maybe<CrudResponseDelete>;
  login: LoginResponse;
  logout: LogoutResponse;
  setConfig?: Maybe<AppConfigSet>;
  setInvestmentBucket?: Maybe<SetInvestmentBucketResponse>;
  updateCashAllocationTarget?: Maybe<CrudResponseUpdate>;
  updateFund?: Maybe<CrudResponseUpdate>;
  updateFundAllocationTargets?: Maybe<UpdatedFundAllocationTargets>;
  updateListItem?: Maybe<CrudResponseUpdate>;
  updateNetWorthCategory?: Maybe<CrudResponseUpdate>;
  updateNetWorthEntry?: Maybe<CrudResponseUpdate>;
  updateNetWorthSubcategory?: Maybe<CrudResponseUpdate>;
  upsertBucket?: Maybe<UpsertBucketResponse>;
};


export type MutationCreateFundArgs = {
  fakeId: Scalars['Int'];
  input: FundInput;
};


export type MutationCreateListItemArgs = {
  page: PageListStandard;
  fakeId: Scalars['Int'];
  input: ListItemStandardInput;
};


export type MutationCreateNetWorthCategoryArgs = {
  input: NetWorthCategoryInput;
};


export type MutationCreateNetWorthEntryArgs = {
  input: NetWorthEntryInput;
};


export type MutationCreateNetWorthSubcategoryArgs = {
  input: NetWorthSubcategoryInput;
};


export type MutationCreateReceiptArgs = {
  date: Scalars['Date'];
  shop: Scalars['String'];
  items: Array<ReceiptInput>;
};


export type MutationDeleteFundArgs = {
  id: Scalars['Int'];
};


export type MutationDeleteListItemArgs = {
  page: PageListStandard;
  id: Scalars['Int'];
};


export type MutationDeleteNetWorthCategoryArgs = {
  id: Scalars['Int'];
};


export type MutationDeleteNetWorthEntryArgs = {
  id: Scalars['Int'];
};


export type MutationDeleteNetWorthSubcategoryArgs = {
  id: Scalars['Int'];
};


export type MutationLoginArgs = {
  pin: Scalars['Int'];
};


export type MutationSetConfigArgs = {
  config: AppConfigInput;
};


export type MutationSetInvestmentBucketArgs = {
  value: Scalars['NonNegativeInt'];
};


export type MutationUpdateCashAllocationTargetArgs = {
  target: Scalars['NonNegativeInt'];
};


export type MutationUpdateFundArgs = {
  id: Scalars['Int'];
  input: FundInput;
};


export type MutationUpdateFundAllocationTargetsArgs = {
  deltas: Array<TargetDelta>;
};


export type MutationUpdateListItemArgs = {
  page: PageListStandard;
  id: Scalars['Int'];
  input: ListItemStandardInput;
};


export type MutationUpdateNetWorthCategoryArgs = {
  id: Scalars['Int'];
  input: NetWorthCategoryInput;
};


export type MutationUpdateNetWorthEntryArgs = {
  id: Scalars['Int'];
  input: NetWorthEntryInput;
};


export type MutationUpdateNetWorthSubcategoryArgs = {
  id: Scalars['Int'];
  input: NetWorthSubcategoryInput;
};


export type MutationUpsertBucketArgs = {
  startDate: Scalars['String'];
  endDate: Scalars['String'];
  id: Scalars['NonNegativeInt'];
  bucket: BucketInput;
};

export type NetWorthCashTotal = {
  cashInBank: Scalars['Int'];
  stockValue: Scalars['Int'];
  stocksIncludingCash: Scalars['Int'];
  date?: Maybe<Scalars['Date']>;
  incomeSince: Scalars['Int'];
  spendingSince: Scalars['Int'];
};

export type NetWorthCategory = {
  id: Scalars['Int'];
  type: NetWorthCategoryType;
  category: Scalars['String'];
  color: Scalars['String'];
  isOption?: Maybe<Scalars['Boolean']>;
};

export type NetWorthCategoryCreated = {
  error?: Maybe<Scalars['String']>;
  item?: Maybe<NetWorthCategory>;
};

export type NetWorthCategoryInput = {
  type: NetWorthCategoryType;
  category: Scalars['String'];
  color: Scalars['String'];
  isOption?: Maybe<Scalars['Boolean']>;
};

export enum NetWorthCategoryType {
  Asset = 'asset',
  Liability = 'liability'
}

export type NetWorthCategoryUpdated = {
  error?: Maybe<Scalars['String']>;
  item?: Maybe<NetWorthCategory>;
};

export type NetWorthDeleted = {
  error?: Maybe<Scalars['String']>;
  id: Scalars['Int'];
};

export type NetWorthEntry = {
  id: Scalars['Int'];
  date: Scalars['Date'];
  values: Array<NetWorthValueObject>;
  creditLimit: Array<CreditLimit>;
  currencies: Array<Currency>;
};

export type NetWorthEntryCreated = {
  error?: Maybe<Scalars['String']>;
  item?: Maybe<NetWorthEntry>;
};

export type NetWorthEntryInput = {
  date: Scalars['Date'];
  values: Array<NetWorthValueInput>;
  creditLimit: Array<CreditLimitInput>;
  currencies: Array<CurrencyInput>;
};

export type NetWorthEntryOverview = {
  current: Array<NetWorthEntry>;
};

export type NetWorthEntryUpdated = {
  error?: Maybe<Scalars['String']>;
  item?: Maybe<NetWorthEntry>;
};

export type NetWorthLoan = {
  subcategory: Scalars['String'];
  values: Array<NetWorthLoanValue>;
};

export type NetWorthLoanValue = {
  date: Scalars['Date'];
  value: LoanValue;
};

export type NetWorthLoansResponse = {
  error?: Maybe<Scalars['String']>;
  loans?: Maybe<Array<NetWorthLoan>>;
};

export type NetWorthSubcategory = {
  id: Scalars['Int'];
  categoryId: Scalars['Int'];
  subcategory: Scalars['String'];
  hasCreditLimit?: Maybe<Scalars['Boolean']>;
  appreciationRate?: Maybe<Scalars['Float']>;
  isSAYE?: Maybe<Scalars['Boolean']>;
  opacity?: Maybe<Scalars['Float']>;
};

export type NetWorthSubcategoryCreated = {
  error?: Maybe<Scalars['String']>;
  item?: Maybe<NetWorthSubcategory>;
};

export type NetWorthSubcategoryInput = {
  categoryId: Scalars['Int'];
  subcategory: Scalars['String'];
  hasCreditLimit?: Maybe<Scalars['Boolean']>;
  appreciationRate?: Maybe<Scalars['Float']>;
  isSAYE?: Maybe<Scalars['Boolean']>;
  opacity?: Maybe<Scalars['Float']>;
};

export type NetWorthSubcategoryUpdated = {
  error?: Maybe<Scalars['String']>;
  item?: Maybe<NetWorthSubcategory>;
};

export type NetWorthValueInput = {
  subcategory: Scalars['Int'];
  skip?: Maybe<Scalars['Boolean']>;
  simple?: Maybe<Scalars['Int']>;
  fx?: Maybe<Array<FxValueInput>>;
  option?: Maybe<OptionValueInput>;
  loan?: Maybe<LoanValueInput>;
};

export type NetWorthValueObject = {
  subcategory: Scalars['Int'];
  skip?: Maybe<Scalars['Boolean']>;
  value: Scalars['Int'];
  simple?: Maybe<Scalars['Int']>;
  fx?: Maybe<Array<FxValue>>;
  option?: Maybe<OptionValue>;
  loan?: Maybe<LoanValue>;
};



export type OptionValue = {
  units: Scalars['NonNegativeInt'];
  strikePrice: Scalars['NonNegativeFloat'];
  marketPrice: Scalars['NonNegativeFloat'];
  vested: Scalars['NonNegativeInt'];
};

export type OptionValueInput = {
  units: Scalars['NonNegativeInt'];
  strikePrice: Scalars['NonNegativeFloat'];
  marketPrice: Scalars['NonNegativeFloat'];
  vested?: Maybe<Scalars['NonNegativeInt']>;
};

export type Overview = {
  startDate: Scalars['Date'];
  endDate: Scalars['Date'];
  monthly: Monthly;
  initialCumulativeValues: InitialCumulativeValues;
};

export type OverviewOld = {
  startDate: Scalars['Date'];
  assets: Array<Scalars['Int']>;
  liabilities: Array<Scalars['Int']>;
  netWorth: Array<Scalars['Int']>;
  stocks: Array<Scalars['Int']>;
  investmentPurchases: Array<Scalars['Int']>;
  pension: Array<Scalars['Int']>;
  cashLiquid: Array<Scalars['Int']>;
  cashOther: Array<Scalars['Int']>;
  investments: Array<Scalars['Int']>;
  illiquidEquity: Array<Scalars['Int']>;
  options: Array<Scalars['Int']>;
  income: Array<Scalars['Int']>;
  spending: Array<Scalars['Int']>;
};

export type OverviewPreview = {
  startDate: Scalars['Date'];
  values: Array<Scalars['Int']>;
};

export enum PageListStandard {
  Income = 'income',
  Bills = 'bills',
  Food = 'food',
  General = 'general',
  Social = 'social',
  Holiday = 'holiday'
}


export type Query = {
  analysis?: Maybe<AnalysisResponse>;
  analysisDeep?: Maybe<Array<CategoryCostTreeDeep>>;
  cashAllocationTarget?: Maybe<Scalars['NonNegativeInt']>;
  config?: Maybe<AppConfig>;
  exchangeRates?: Maybe<ExchangeRatesResponse>;
  fundHistory?: Maybe<FundHistory>;
  fundHistoryIndividual?: Maybe<FundHistoryIndividual>;
  listBuckets?: Maybe<ListBucketsResponse>;
  netWorthCashTotal?: Maybe<NetWorthCashTotal>;
  netWorthLoans?: Maybe<NetWorthLoansResponse>;
  overview?: Maybe<Overview>;
  overviewOld?: Maybe<OverviewOld>;
  overviewPreview?: Maybe<OverviewPreview>;
  readFunds?: Maybe<ReadFundsResponse>;
  readList?: Maybe<ListReadResponse>;
  readNetWorthCategories?: Maybe<Array<NetWorthCategory>>;
  readNetWorthEntries?: Maybe<NetWorthEntryOverview>;
  readNetWorthSubcategories?: Maybe<Array<NetWorthSubcategory>>;
  receiptItem?: Maybe<Scalars['String']>;
  receiptItems?: Maybe<Array<ReceiptCategory>>;
  search?: Maybe<SearchResult>;
  stockPrices?: Maybe<StockPricesResponse>;
  whoami?: Maybe<UserInfo>;
};


export type QueryAnalysisArgs = {
  period: AnalysisPeriod;
  groupBy: AnalysisGroupBy;
  page?: Maybe<Scalars['Int']>;
};


export type QueryAnalysisDeepArgs = {
  category: AnalysisPage;
  period: AnalysisPeriod;
  groupBy: AnalysisGroupBy;
  page?: Maybe<Scalars['Int']>;
};


export type QueryExchangeRatesArgs = {
  base: Scalars['String'];
};


export type QueryFundHistoryArgs = {
  period?: Maybe<FundPeriod>;
  length?: Maybe<Scalars['NonNegativeInt']>;
};


export type QueryFundHistoryIndividualArgs = {
  id: Scalars['NonNegativeInt'];
};


export type QueryListBucketsArgs = {
  startDate: Scalars['String'];
  endDate: Scalars['String'];
};


export type QueryOverviewArgs = {
  now?: Maybe<Scalars['Date']>;
};


export type QueryOverviewOldArgs = {
  now?: Maybe<Scalars['Date']>;
};


export type QueryOverviewPreviewArgs = {
  category: MonthlyCategory;
  date: Scalars['Date'];
};


export type QueryReadListArgs = {
  page: PageListStandard;
  offset?: Maybe<Scalars['Int']>;
  limit?: Maybe<Scalars['Int']>;
};


export type QueryReadNetWorthCategoriesArgs = {
  id?: Maybe<Scalars['Int']>;
};


export type QueryReadNetWorthSubcategoriesArgs = {
  id?: Maybe<Scalars['Int']>;
};


export type QueryReceiptItemArgs = {
  item: Scalars['String'];
};


export type QueryReceiptItemsArgs = {
  items: Array<Scalars['String']>;
};


export type QuerySearchArgs = {
  page: SearchPage;
  column: SearchItem;
  searchTerm: Scalars['String'];
  numResults?: Maybe<Scalars['Int']>;
};


export type QueryStockPricesArgs = {
  codes: Array<Scalars['String']>;
};

export type ReadFundsResponse = {
  items: Array<Fund>;
};

export type ReceiptCategory = {
  item: Scalars['String'];
  page: ReceiptPage;
  category: Scalars['String'];
};

export type ReceiptCreated = {
  error?: Maybe<Scalars['String']>;
  items?: Maybe<Array<ReceiptItem>>;
};

export type ReceiptInput = {
  page: ReceiptPage;
  item: Scalars['String'];
  category: Scalars['String'];
  cost: Scalars['Int'];
};

export type ReceiptItem = {
  page: ReceiptPage;
  id: Scalars['Int'];
  date: Scalars['Date'];
  item: Scalars['String'];
  category: Scalars['String'];
  cost: Scalars['Int'];
  shop: Scalars['String'];
};

export enum ReceiptPage {
  Food = 'food',
  General = 'general',
  Social = 'social'
}

export enum SearchItem {
  Item = 'item',
  Category = 'category',
  Shop = 'shop'
}

export enum SearchPage {
  Income = 'income',
  Bills = 'bills',
  Food = 'food',
  General = 'general',
  Holiday = 'holiday',
  Social = 'social'
}

export type SearchResult = {
  error?: Maybe<Scalars['String']>;
  searchTerm?: Maybe<Scalars['String']>;
  list: Array<Scalars['String']>;
  nextCategory?: Maybe<Array<Scalars['String']>>;
  nextField?: Maybe<Scalars['String']>;
};

export type SetInvestmentBucketResponse = {
  expectedValue?: Maybe<Scalars['NonNegativeInt']>;
  error?: Maybe<Scalars['String']>;
};

export type SimpleValue = {
  value: Scalars['Int'];
};

export type StockPrice = {
  code: Scalars['String'];
  price?: Maybe<Scalars['NonNegativeFloat']>;
};

export type StockPricesResponse = {
  error?: Maybe<Scalars['String']>;
  prices: Array<StockPrice>;
  refreshTime?: Maybe<Scalars['DateTime']>;
};

export type StockSplit = {
  date: Scalars['Date'];
  ratio: Scalars['NonNegativeFloat'];
};

export type StockSplitInput = {
  date: Scalars['Date'];
  ratio: Scalars['NonNegativeFloat'];
};

export type Subscription = {
  cashAllocationTargetUpdated: Scalars['NonNegativeInt'];
  configUpdated: AppConfig;
  fundAllocationTargetsUpdated: UpdatedFundAllocationTargets;
  fundCreated: FundCreateUpdate;
  fundDeleted: FundDelete;
  fundPricesUpdated?: Maybe<FundHistory>;
  fundUpdated: FundCreateUpdate;
  listItemCreated: ListItemCreateUpdate;
  listItemDeleted: ListItemDelete;
  listItemUpdated: ListItemCreateUpdate;
  netWorthCashTotalUpdated: NetWorthCashTotal;
  netWorthCategoryCreated: NetWorthCategoryCreated;
  netWorthCategoryDeleted: NetWorthDeleted;
  netWorthCategoryUpdated: NetWorthCategoryUpdated;
  netWorthEntryCreated: NetWorthEntryCreated;
  netWorthEntryDeleted: NetWorthDeleted;
  netWorthEntryUpdated: NetWorthEntryUpdated;
  netWorthSubcategoryCreated: NetWorthSubcategoryCreated;
  netWorthSubcategoryDeleted: NetWorthDeleted;
  netWorthSubcategoryUpdated: NetWorthSubcategoryUpdated;
  receiptCreated: ReceiptCreated;
};


export type SubscriptionFundPricesUpdatedArgs = {
  period?: Maybe<FundPeriod>;
  length?: Maybe<Scalars['NonNegativeInt']>;
};


export type SubscriptionListItemCreatedArgs = {
  pages: Array<PageListStandard>;
};


export type SubscriptionListItemUpdatedArgs = {
  pages: Array<PageListStandard>;
};

export type TargetDelta = {
  id: Scalars['Int'];
  allocationTarget: Scalars['NonNegativeInt'];
};

export type TargetDeltaResponse = {
  id: Scalars['Int'];
  allocationTarget: Scalars['NonNegativeInt'];
};

export type Transaction = {
  date: Scalars['Date'];
  units: Scalars['Float'];
  price: Scalars['NonNegativeFloat'];
  fees: Scalars['Int'];
  taxes: Scalars['Int'];
  drip: Scalars['Boolean'];
};

export type TransactionInput = {
  date: Scalars['Date'];
  units: Scalars['Float'];
  price: Scalars['NonNegativeFloat'];
  fees: Scalars['Int'];
  taxes: Scalars['Int'];
  drip: Scalars['Boolean'];
};

export type UpdatedFundAllocationTargets = {
  error?: Maybe<Scalars['String']>;
  deltas?: Maybe<Array<TargetDeltaResponse>>;
};

export type UpsertBucketResponse = {
  buckets?: Maybe<Array<Bucket>>;
  error?: Maybe<Scalars['String']>;
};

export type User = {
  uid: Scalars['Int'];
};

export type UserInfo = {
  uid: Scalars['Int'];
  name: Scalars['String'];
};



export type ResolverTypeWrapper<T> = Promise<T> | T;


export type LegacyStitchingResolver<TResult, TParent, TContext, TArgs> = {
  fragment: string;
  resolve: ResolverFn<TResult, TParent, TContext, TArgs>;
};

export type NewStitchingResolver<TResult, TParent, TContext, TArgs> = {
  selectionSet: string;
  resolve: ResolverFn<TResult, TParent, TContext, TArgs>;
};
export type StitchingResolver<TResult, TParent, TContext, TArgs> = LegacyStitchingResolver<TResult, TParent, TContext, TArgs> | NewStitchingResolver<TResult, TParent, TContext, TArgs>;
export type Resolver<TResult, TParent = {}, TContext = {}, TArgs = {}> =
  | ResolverFn<TResult, TParent, TContext, TArgs>
  | StitchingResolver<TResult, TParent, TContext, TArgs>;

export type ResolverFn<TResult, TParent, TContext, TArgs> = (
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => Promise<TResult> | TResult;

export type SubscriptionSubscribeFn<TResult, TParent, TContext, TArgs> = (
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => AsyncIterator<TResult> | Promise<AsyncIterator<TResult>>;

export type SubscriptionResolveFn<TResult, TParent, TContext, TArgs> = (
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => TResult | Promise<TResult>;

export interface SubscriptionSubscriberObject<TResult, TKey extends string, TParent, TContext, TArgs> {
  subscribe: SubscriptionSubscribeFn<{ [key in TKey]: TResult }, TParent, TContext, TArgs>;
  resolve?: SubscriptionResolveFn<TResult, { [key in TKey]: TResult }, TContext, TArgs>;
}

export interface SubscriptionResolverObject<TResult, TParent, TContext, TArgs> {
  subscribe: SubscriptionSubscribeFn<any, TParent, TContext, TArgs>;
  resolve: SubscriptionResolveFn<TResult, any, TContext, TArgs>;
}

export type SubscriptionObject<TResult, TKey extends string, TParent, TContext, TArgs> =
  | SubscriptionSubscriberObject<TResult, TKey, TParent, TContext, TArgs>
  | SubscriptionResolverObject<TResult, TParent, TContext, TArgs>;

export type SubscriptionResolver<TResult, TKey extends string, TParent = {}, TContext = {}, TArgs = {}> =
  | ((...args: any[]) => SubscriptionObject<TResult, TKey, TParent, TContext, TArgs>)
  | SubscriptionObject<TResult, TKey, TParent, TContext, TArgs>;

export type TypeResolveFn<TTypes, TParent = {}, TContext = {}> = (
  parent: TParent,
  context: TContext,
  info: GraphQLResolveInfo
) => Maybe<TTypes> | Promise<Maybe<TTypes>>;

export type IsTypeOfResolverFn<T = {}, TContext = {}> = (obj: T, context: TContext, info: GraphQLResolveInfo) => boolean | Promise<boolean>;

export type NextResolverFn<T> = () => Promise<T>;

export type DirectiveResolverFn<TResult = {}, TParent = {}, TContext = {}, TArgs = {}> = (
  next: NextResolverFn<TResult>,
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => TResult | Promise<TResult>;

/** Mapping between all available schema types and the resolvers types */
export type ResolversTypes = {
  AnalysisGroupBy: AnalysisGroupBy;
  AnalysisPage: AnalysisPage;
  AnalysisPeriod: AnalysisPeriod;
  AnalysisResponse: ResolverTypeWrapper<AnalysisResponse>;
  String: ResolverTypeWrapper<Scalars['String']>;
  AppConfig: ResolverTypeWrapper<AppConfig>;
  Int: ResolverTypeWrapper<Scalars['Int']>;
  Boolean: ResolverTypeWrapper<Scalars['Boolean']>;
  AppConfigInput: AppConfigInput;
  AppConfigSet: ResolverTypeWrapper<AppConfigSet>;
  Bucket: ResolverTypeWrapper<Bucket>;
  BucketInput: BucketInput;
  CategoryCostTree: ResolverTypeWrapper<CategoryCostTree>;
  CategoryCostTreeDeep: ResolverTypeWrapper<CategoryCostTreeDeep>;
  CategoryTreeItem: ResolverTypeWrapper<CategoryTreeItem>;
  CreditLimit: ResolverTypeWrapper<CreditLimit>;
  CreditLimitInput: CreditLimitInput;
  CrudResponseCreate: ResolverTypeWrapper<CrudResponseCreate>;
  CrudResponseDelete: ResolverTypeWrapper<CrudResponseDelete>;
  CrudResponseUpdate: ResolverTypeWrapper<CrudResponseUpdate>;
  Currency: ResolverTypeWrapper<Currency>;
  CurrencyInput: CurrencyInput;
  Date: ResolverTypeWrapper<Scalars['Date']>;
  DateTime: ResolverTypeWrapper<Scalars['DateTime']>;
  ExchangeRate: ResolverTypeWrapper<ExchangeRate>;
  ExchangeRatesResponse: ResolverTypeWrapper<ExchangeRatesResponse>;
  FXValue: ResolverTypeWrapper<FxValue>;
  Float: ResolverTypeWrapper<Scalars['Float']>;
  FXValueInput: FxValueInput;
  Fund: ResolverTypeWrapper<Fund>;
  FundCreateUpdate: ResolverTypeWrapper<FundCreateUpdate>;
  FundData: ResolverTypeWrapper<FundData>;
  FundDelete: ResolverTypeWrapper<FundDelete>;
  FundHistory: ResolverTypeWrapper<FundHistory>;
  FundHistoryIndividual: ResolverTypeWrapper<FundHistoryIndividual>;
  FundInput: FundInput;
  FundMode: FundMode;
  FundPeriod: FundPeriod;
  FundPriceGroup: ResolverTypeWrapper<FundPriceGroup>;
  FundPrices: ResolverTypeWrapper<FundPrices>;
  FundValueIndividual: ResolverTypeWrapper<FundValueIndividual>;
  InitialCumulativeValues: ResolverTypeWrapper<InitialCumulativeValues>;
  InvestmentBucket: ResolverTypeWrapper<InvestmentBucket>;
  InvestmentBucketInput: ResolverTypeWrapper<InvestmentBucketInput>;
  ListBucketsResponse: ResolverTypeWrapper<ListBucketsResponse>;
  ListItem: ResolverTypeWrapper<ListItem>;
  ListItemCreateUpdate: ResolverTypeWrapper<ListItemCreateUpdate>;
  ListItemDelete: ResolverTypeWrapper<ListItemDelete>;
  ListItemInput: ListItemInput;
  ListItemStandard: ResolverTypeWrapper<ListItemStandard>;
  ListItemStandardInput: ListItemStandardInput;
  ListItemStandardSubscription: ResolverTypeWrapper<ListItemStandardSubscription>;
  ListReadResponse: ResolverTypeWrapper<ListReadResponse>;
  ListTotalsResponse: ResolverTypeWrapper<ListTotalsResponse>;
  LoanValue: ResolverTypeWrapper<LoanValue>;
  LoanValueInput: LoanValueInput;
  LoginResponse: ResolverTypeWrapper<LoginResponse>;
  LogoutResponse: ResolverTypeWrapper<LogoutResponse>;
  Monthly: ResolverTypeWrapper<Monthly>;
  MonthlyCategory: MonthlyCategory;
  Mutation: ResolverTypeWrapper<{}>;
  NetWorthCashTotal: ResolverTypeWrapper<NetWorthCashTotal>;
  NetWorthCategory: ResolverTypeWrapper<NetWorthCategory>;
  NetWorthCategoryCreated: ResolverTypeWrapper<NetWorthCategoryCreated>;
  NetWorthCategoryInput: NetWorthCategoryInput;
  NetWorthCategoryType: NetWorthCategoryType;
  NetWorthCategoryUpdated: ResolverTypeWrapper<NetWorthCategoryUpdated>;
  NetWorthDeleted: ResolverTypeWrapper<NetWorthDeleted>;
  NetWorthEntry: ResolverTypeWrapper<NetWorthEntry>;
  NetWorthEntryCreated: ResolverTypeWrapper<NetWorthEntryCreated>;
  NetWorthEntryInput: NetWorthEntryInput;
  NetWorthEntryOverview: ResolverTypeWrapper<NetWorthEntryOverview>;
  NetWorthEntryUpdated: ResolverTypeWrapper<NetWorthEntryUpdated>;
  NetWorthLoan: ResolverTypeWrapper<NetWorthLoan>;
  NetWorthLoanValue: ResolverTypeWrapper<NetWorthLoanValue>;
  NetWorthLoansResponse: ResolverTypeWrapper<NetWorthLoansResponse>;
  NetWorthSubcategory: ResolverTypeWrapper<NetWorthSubcategory>;
  NetWorthSubcategoryCreated: ResolverTypeWrapper<NetWorthSubcategoryCreated>;
  NetWorthSubcategoryInput: NetWorthSubcategoryInput;
  NetWorthSubcategoryUpdated: ResolverTypeWrapper<NetWorthSubcategoryUpdated>;
  NetWorthValueInput: NetWorthValueInput;
  NetWorthValueObject: ResolverTypeWrapper<NetWorthValueObject>;
  NonNegativeFloat: ResolverTypeWrapper<Scalars['NonNegativeFloat']>;
  NonNegativeInt: ResolverTypeWrapper<Scalars['NonNegativeInt']>;
  OptionValue: ResolverTypeWrapper<OptionValue>;
  OptionValueInput: OptionValueInput;
  Overview: ResolverTypeWrapper<Overview>;
  OverviewOld: ResolverTypeWrapper<OverviewOld>;
  OverviewPreview: ResolverTypeWrapper<OverviewPreview>;
  PageListStandard: PageListStandard;
  PositiveInt: ResolverTypeWrapper<Scalars['PositiveInt']>;
  Query: ResolverTypeWrapper<{}>;
  ReadFundsResponse: ResolverTypeWrapper<ReadFundsResponse>;
  ReceiptCategory: ResolverTypeWrapper<ReceiptCategory>;
  ReceiptCreated: ResolverTypeWrapper<ReceiptCreated>;
  ReceiptInput: ReceiptInput;
  ReceiptItem: ResolverTypeWrapper<ReceiptItem>;
  ReceiptPage: ReceiptPage;
  SearchItem: SearchItem;
  SearchPage: SearchPage;
  SearchResult: ResolverTypeWrapper<SearchResult>;
  SetInvestmentBucketResponse: ResolverTypeWrapper<SetInvestmentBucketResponse>;
  SimpleValue: ResolverTypeWrapper<SimpleValue>;
  StockPrice: ResolverTypeWrapper<StockPrice>;
  StockPricesResponse: ResolverTypeWrapper<StockPricesResponse>;
  StockSplit: ResolverTypeWrapper<StockSplit>;
  StockSplitInput: StockSplitInput;
  Subscription: ResolverTypeWrapper<{}>;
  TargetDelta: TargetDelta;
  TargetDeltaResponse: ResolverTypeWrapper<TargetDeltaResponse>;
  Transaction: ResolverTypeWrapper<Transaction>;
  TransactionInput: TransactionInput;
  UpdatedFundAllocationTargets: ResolverTypeWrapper<UpdatedFundAllocationTargets>;
  UpsertBucketResponse: ResolverTypeWrapper<UpsertBucketResponse>;
  User: ResolverTypeWrapper<User>;
  UserInfo: ResolverTypeWrapper<UserInfo>;
};

/** Mapping between all available schema types and the resolvers parents */
export type ResolversParentTypes = {
  AnalysisResponse: AnalysisResponse;
  String: Scalars['String'];
  AppConfig: AppConfig;
  Int: Scalars['Int'];
  Boolean: Scalars['Boolean'];
  AppConfigInput: AppConfigInput;
  AppConfigSet: AppConfigSet;
  Bucket: Bucket;
  BucketInput: BucketInput;
  CategoryCostTree: CategoryCostTree;
  CategoryCostTreeDeep: CategoryCostTreeDeep;
  CategoryTreeItem: CategoryTreeItem;
  CreditLimit: CreditLimit;
  CreditLimitInput: CreditLimitInput;
  CrudResponseCreate: CrudResponseCreate;
  CrudResponseDelete: CrudResponseDelete;
  CrudResponseUpdate: CrudResponseUpdate;
  Currency: Currency;
  CurrencyInput: CurrencyInput;
  Date: Scalars['Date'];
  DateTime: Scalars['DateTime'];
  ExchangeRate: ExchangeRate;
  ExchangeRatesResponse: ExchangeRatesResponse;
  FXValue: FxValue;
  Float: Scalars['Float'];
  FXValueInput: FxValueInput;
  Fund: Fund;
  FundCreateUpdate: FundCreateUpdate;
  FundData: FundData;
  FundDelete: FundDelete;
  FundHistory: FundHistory;
  FundHistoryIndividual: FundHistoryIndividual;
  FundInput: FundInput;
  FundPriceGroup: FundPriceGroup;
  FundPrices: FundPrices;
  FundValueIndividual: FundValueIndividual;
  InitialCumulativeValues: InitialCumulativeValues;
  InvestmentBucket: InvestmentBucket;
  InvestmentBucketInput: InvestmentBucketInput;
  ListBucketsResponse: ListBucketsResponse;
  ListItem: ListItem;
  ListItemCreateUpdate: ListItemCreateUpdate;
  ListItemDelete: ListItemDelete;
  ListItemInput: ListItemInput;
  ListItemStandard: ListItemStandard;
  ListItemStandardInput: ListItemStandardInput;
  ListItemStandardSubscription: ListItemStandardSubscription;
  ListReadResponse: ListReadResponse;
  ListTotalsResponse: ListTotalsResponse;
  LoanValue: LoanValue;
  LoanValueInput: LoanValueInput;
  LoginResponse: LoginResponse;
  LogoutResponse: LogoutResponse;
  Monthly: Monthly;
  Mutation: {};
  NetWorthCashTotal: NetWorthCashTotal;
  NetWorthCategory: NetWorthCategory;
  NetWorthCategoryCreated: NetWorthCategoryCreated;
  NetWorthCategoryInput: NetWorthCategoryInput;
  NetWorthCategoryUpdated: NetWorthCategoryUpdated;
  NetWorthDeleted: NetWorthDeleted;
  NetWorthEntry: NetWorthEntry;
  NetWorthEntryCreated: NetWorthEntryCreated;
  NetWorthEntryInput: NetWorthEntryInput;
  NetWorthEntryOverview: NetWorthEntryOverview;
  NetWorthEntryUpdated: NetWorthEntryUpdated;
  NetWorthLoan: NetWorthLoan;
  NetWorthLoanValue: NetWorthLoanValue;
  NetWorthLoansResponse: NetWorthLoansResponse;
  NetWorthSubcategory: NetWorthSubcategory;
  NetWorthSubcategoryCreated: NetWorthSubcategoryCreated;
  NetWorthSubcategoryInput: NetWorthSubcategoryInput;
  NetWorthSubcategoryUpdated: NetWorthSubcategoryUpdated;
  NetWorthValueInput: NetWorthValueInput;
  NetWorthValueObject: NetWorthValueObject;
  NonNegativeFloat: Scalars['NonNegativeFloat'];
  NonNegativeInt: Scalars['NonNegativeInt'];
  OptionValue: OptionValue;
  OptionValueInput: OptionValueInput;
  Overview: Overview;
  OverviewOld: OverviewOld;
  OverviewPreview: OverviewPreview;
  PositiveInt: Scalars['PositiveInt'];
  Query: {};
  ReadFundsResponse: ReadFundsResponse;
  ReceiptCategory: ReceiptCategory;
  ReceiptCreated: ReceiptCreated;
  ReceiptInput: ReceiptInput;
  ReceiptItem: ReceiptItem;
  SearchResult: SearchResult;
  SetInvestmentBucketResponse: SetInvestmentBucketResponse;
  SimpleValue: SimpleValue;
  StockPrice: StockPrice;
  StockPricesResponse: StockPricesResponse;
  StockSplit: StockSplit;
  StockSplitInput: StockSplitInput;
  Subscription: {};
  TargetDelta: TargetDelta;
  TargetDeltaResponse: TargetDeltaResponse;
  Transaction: Transaction;
  TransactionInput: TransactionInput;
  UpdatedFundAllocationTargets: UpdatedFundAllocationTargets;
  UpsertBucketResponse: UpsertBucketResponse;
  User: User;
  UserInfo: UserInfo;
};

export type AnalysisResponseResolvers<ContextType = Context, ParentType extends ResolversParentTypes['AnalysisResponse'] = ResolversParentTypes['AnalysisResponse']> = {
  cost?: Resolver<Array<ResolversTypes['CategoryCostTree']>, ParentType, ContextType>;
  description?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  startDate?: Resolver<ResolversTypes['Date'], ParentType, ContextType>;
  endDate?: Resolver<ResolversTypes['Date'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type AppConfigResolvers<ContextType = Context, ParentType extends ResolversParentTypes['AppConfig'] = ResolversParentTypes['AppConfig']> = {
  birthDate?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  futureMonths?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  realTimePrices?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  fundMode?: Resolver<Maybe<ResolversTypes['FundMode']>, ParentType, ContextType>;
  fundPeriod?: Resolver<Maybe<ResolversTypes['FundPeriod']>, ParentType, ContextType>;
  fundLength?: Resolver<Maybe<ResolversTypes['NonNegativeInt']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type AppConfigSetResolvers<ContextType = Context, ParentType extends ResolversParentTypes['AppConfigSet'] = ResolversParentTypes['AppConfigSet']> = {
  config?: Resolver<Maybe<ResolversTypes['AppConfig']>, ParentType, ContextType>;
  error?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type BucketResolvers<ContextType = Context, ParentType extends ResolversParentTypes['Bucket'] = ResolversParentTypes['Bucket']> = {
  id?: Resolver<ResolversTypes['NonNegativeInt'], ParentType, ContextType>;
  page?: Resolver<ResolversTypes['AnalysisPage'], ParentType, ContextType>;
  filterCategory?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  expectedValue?: Resolver<ResolversTypes['NonNegativeInt'], ParentType, ContextType>;
  actualValue?: Resolver<ResolversTypes['NonNegativeInt'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type CategoryCostTreeResolvers<ContextType = Context, ParentType extends ResolversParentTypes['CategoryCostTree'] = ResolversParentTypes['CategoryCostTree']> = {
  item?: Resolver<ResolversTypes['AnalysisPage'], ParentType, ContextType>;
  tree?: Resolver<Array<ResolversTypes['CategoryTreeItem']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type CategoryCostTreeDeepResolvers<ContextType = Context, ParentType extends ResolversParentTypes['CategoryCostTreeDeep'] = ResolversParentTypes['CategoryCostTreeDeep']> = {
  item?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  tree?: Resolver<Array<ResolversTypes['CategoryTreeItem']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type CategoryTreeItemResolvers<ContextType = Context, ParentType extends ResolversParentTypes['CategoryTreeItem'] = ResolversParentTypes['CategoryTreeItem']> = {
  category?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  sum?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type CreditLimitResolvers<ContextType = Context, ParentType extends ResolversParentTypes['CreditLimit'] = ResolversParentTypes['CreditLimit']> = {
  subcategory?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  value?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type CrudResponseCreateResolvers<ContextType = Context, ParentType extends ResolversParentTypes['CrudResponseCreate'] = ResolversParentTypes['CrudResponseCreate']> = {
  error?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  id?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type CrudResponseDeleteResolvers<ContextType = Context, ParentType extends ResolversParentTypes['CrudResponseDelete'] = ResolversParentTypes['CrudResponseDelete']> = {
  error?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type CrudResponseUpdateResolvers<ContextType = Context, ParentType extends ResolversParentTypes['CrudResponseUpdate'] = ResolversParentTypes['CrudResponseUpdate']> = {
  error?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type CurrencyResolvers<ContextType = Context, ParentType extends ResolversParentTypes['Currency'] = ResolversParentTypes['Currency']> = {
  currency?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  rate?: Resolver<ResolversTypes['NonNegativeFloat'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export interface DateScalarConfig extends GraphQLScalarTypeConfig<ResolversTypes['Date'], any> {
  name: 'Date';
}

export interface DateTimeScalarConfig extends GraphQLScalarTypeConfig<ResolversTypes['DateTime'], any> {
  name: 'DateTime';
}

export type ExchangeRateResolvers<ContextType = Context, ParentType extends ResolversParentTypes['ExchangeRate'] = ResolversParentTypes['ExchangeRate']> = {
  currency?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  rate?: Resolver<ResolversTypes['NonNegativeFloat'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type ExchangeRatesResponseResolvers<ContextType = Context, ParentType extends ResolversParentTypes['ExchangeRatesResponse'] = ResolversParentTypes['ExchangeRatesResponse']> = {
  error?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  rates?: Resolver<Maybe<Array<ResolversTypes['ExchangeRate']>>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type FxValueResolvers<ContextType = Context, ParentType extends ResolversParentTypes['FXValue'] = ResolversParentTypes['FXValue']> = {
  value?: Resolver<ResolversTypes['Float'], ParentType, ContextType>;
  currency?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type FundResolvers<ContextType = Context, ParentType extends ResolversParentTypes['Fund'] = ResolversParentTypes['Fund']> = {
  id?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  item?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  transactions?: Resolver<Array<ResolversTypes['Transaction']>, ParentType, ContextType>;
  allocationTarget?: Resolver<Maybe<ResolversTypes['NonNegativeInt']>, ParentType, ContextType>;
  stockSplits?: Resolver<Array<ResolversTypes['StockSplit']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type FundCreateUpdateResolvers<ContextType = Context, ParentType extends ResolversParentTypes['FundCreateUpdate'] = ResolversParentTypes['FundCreateUpdate']> = {
  id?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  fakeId?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  item?: Resolver<ResolversTypes['FundData'], ParentType, ContextType>;
  overviewCost?: Resolver<Array<ResolversTypes['Int']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type FundDataResolvers<ContextType = Context, ParentType extends ResolversParentTypes['FundData'] = ResolversParentTypes['FundData']> = {
  item?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  transactions?: Resolver<Array<ResolversTypes['Transaction']>, ParentType, ContextType>;
  stockSplits?: Resolver<Array<ResolversTypes['StockSplit']>, ParentType, ContextType>;
  allocationTarget?: Resolver<Maybe<ResolversTypes['NonNegativeInt']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type FundDeleteResolvers<ContextType = Context, ParentType extends ResolversParentTypes['FundDelete'] = ResolversParentTypes['FundDelete']> = {
  id?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  overviewCost?: Resolver<Array<ResolversTypes['Int']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type FundHistoryResolvers<ContextType = Context, ParentType extends ResolversParentTypes['FundHistory'] = ResolversParentTypes['FundHistory']> = {
  startTime?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  cacheTimes?: Resolver<Array<ResolversTypes['Int']>, ParentType, ContextType>;
  prices?: Resolver<Array<ResolversTypes['FundPrices']>, ParentType, ContextType>;
  annualisedFundReturns?: Resolver<ResolversTypes['Float'], ParentType, ContextType>;
  overviewCost?: Resolver<Array<ResolversTypes['Int']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type FundHistoryIndividualResolvers<ContextType = Context, ParentType extends ResolversParentTypes['FundHistoryIndividual'] = ResolversParentTypes['FundHistoryIndividual']> = {
  values?: Resolver<Array<ResolversTypes['FundValueIndividual']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type FundPriceGroupResolvers<ContextType = Context, ParentType extends ResolversParentTypes['FundPriceGroup'] = ResolversParentTypes['FundPriceGroup']> = {
  startIndex?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  values?: Resolver<Array<ResolversTypes['NonNegativeFloat']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type FundPricesResolvers<ContextType = Context, ParentType extends ResolversParentTypes['FundPrices'] = ResolversParentTypes['FundPrices']> = {
  fundId?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  groups?: Resolver<Array<ResolversTypes['FundPriceGroup']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type FundValueIndividualResolvers<ContextType = Context, ParentType extends ResolversParentTypes['FundValueIndividual'] = ResolversParentTypes['FundValueIndividual']> = {
  date?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  price?: Resolver<ResolversTypes['NonNegativeFloat'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type InitialCumulativeValuesResolvers<ContextType = Context, ParentType extends ResolversParentTypes['InitialCumulativeValues'] = ResolversParentTypes['InitialCumulativeValues']> = {
  income?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  spending?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type InvestmentBucketResolvers<ContextType = Context, ParentType extends ResolversParentTypes['InvestmentBucket'] = ResolversParentTypes['InvestmentBucket']> = {
  expectedValue?: Resolver<ResolversTypes['NonNegativeInt'], ParentType, ContextType>;
  purchaseValue?: Resolver<ResolversTypes['NonNegativeInt'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type InvestmentBucketInputResolvers<ContextType = Context, ParentType extends ResolversParentTypes['InvestmentBucketInput'] = ResolversParentTypes['InvestmentBucketInput']> = {
  value?: Resolver<ResolversTypes['NonNegativeInt'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type ListBucketsResponseResolvers<ContextType = Context, ParentType extends ResolversParentTypes['ListBucketsResponse'] = ResolversParentTypes['ListBucketsResponse']> = {
  error?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  buckets?: Resolver<Maybe<Array<ResolversTypes['Bucket']>>, ParentType, ContextType>;
  investmentBucket?: Resolver<Maybe<ResolversTypes['InvestmentBucket']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type ListItemResolvers<ContextType = Context, ParentType extends ResolversParentTypes['ListItem'] = ResolversParentTypes['ListItem']> = {
  id?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  item?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type ListItemCreateUpdateResolvers<ContextType = Context, ParentType extends ResolversParentTypes['ListItemCreateUpdate'] = ResolversParentTypes['ListItemCreateUpdate']> = {
  page?: Resolver<ResolversTypes['PageListStandard'], ParentType, ContextType>;
  id?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  fakeId?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  item?: Resolver<ResolversTypes['ListItemStandardSubscription'], ParentType, ContextType>;
  overviewCost?: Resolver<Array<ResolversTypes['Int']>, ParentType, ContextType>;
  total?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  weekly?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type ListItemDeleteResolvers<ContextType = Context, ParentType extends ResolversParentTypes['ListItemDelete'] = ResolversParentTypes['ListItemDelete']> = {
  page?: Resolver<ResolversTypes['PageListStandard'], ParentType, ContextType>;
  id?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  overviewCost?: Resolver<Array<ResolversTypes['Int']>, ParentType, ContextType>;
  total?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  weekly?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type ListItemStandardResolvers<ContextType = Context, ParentType extends ResolversParentTypes['ListItemStandard'] = ResolversParentTypes['ListItemStandard']> = {
  id?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  date?: Resolver<ResolversTypes['Date'], ParentType, ContextType>;
  item?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  category?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  cost?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  shop?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type ListItemStandardSubscriptionResolvers<ContextType = Context, ParentType extends ResolversParentTypes['ListItemStandardSubscription'] = ResolversParentTypes['ListItemStandardSubscription']> = {
  date?: Resolver<ResolversTypes['Date'], ParentType, ContextType>;
  item?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  category?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  cost?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  shop?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type ListReadResponseResolvers<ContextType = Context, ParentType extends ResolversParentTypes['ListReadResponse'] = ResolversParentTypes['ListReadResponse']> = {
  error?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  items?: Resolver<Array<ResolversTypes['ListItemStandard']>, ParentType, ContextType>;
  olderExists?: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
  weekly?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  total?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type ListTotalsResponseResolvers<ContextType = Context, ParentType extends ResolversParentTypes['ListTotalsResponse'] = ResolversParentTypes['ListTotalsResponse']> = {
  error?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  total?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  weekly?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type LoanValueResolvers<ContextType = Context, ParentType extends ResolversParentTypes['LoanValue'] = ResolversParentTypes['LoanValue']> = {
  principal?: Resolver<ResolversTypes['NonNegativeInt'], ParentType, ContextType>;
  paymentsRemaining?: Resolver<ResolversTypes['NonNegativeInt'], ParentType, ContextType>;
  rate?: Resolver<ResolversTypes['Float'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type LoginResponseResolvers<ContextType = Context, ParentType extends ResolversParentTypes['LoginResponse'] = ResolversParentTypes['LoginResponse']> = {
  error?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  uid?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  name?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  apiKey?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  expires?: Resolver<Maybe<ResolversTypes['DateTime']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type LogoutResponseResolvers<ContextType = Context, ParentType extends ResolversParentTypes['LogoutResponse'] = ResolversParentTypes['LogoutResponse']> = {
  error?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  ok?: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type MonthlyResolvers<ContextType = Context, ParentType extends ResolversParentTypes['Monthly'] = ResolversParentTypes['Monthly']> = {
  investmentPurchases?: Resolver<Array<ResolversTypes['Int']>, ParentType, ContextType>;
  income?: Resolver<Array<ResolversTypes['Int']>, ParentType, ContextType>;
  bills?: Resolver<Array<ResolversTypes['Int']>, ParentType, ContextType>;
  food?: Resolver<Array<ResolversTypes['Int']>, ParentType, ContextType>;
  general?: Resolver<Array<ResolversTypes['Int']>, ParentType, ContextType>;
  holiday?: Resolver<Array<ResolversTypes['Int']>, ParentType, ContextType>;
  social?: Resolver<Array<ResolversTypes['Int']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type MutationResolvers<ContextType = Context, ParentType extends ResolversParentTypes['Mutation'] = ResolversParentTypes['Mutation']> = {
  createFund?: Resolver<Maybe<ResolversTypes['CrudResponseCreate']>, ParentType, ContextType, RequireFields<MutationCreateFundArgs, 'fakeId' | 'input'>>;
  createListItem?: Resolver<Maybe<ResolversTypes['CrudResponseCreate']>, ParentType, ContextType, RequireFields<MutationCreateListItemArgs, 'page' | 'fakeId' | 'input'>>;
  createNetWorthCategory?: Resolver<Maybe<ResolversTypes['CrudResponseCreate']>, ParentType, ContextType, RequireFields<MutationCreateNetWorthCategoryArgs, 'input'>>;
  createNetWorthEntry?: Resolver<Maybe<ResolversTypes['CrudResponseCreate']>, ParentType, ContextType, RequireFields<MutationCreateNetWorthEntryArgs, 'input'>>;
  createNetWorthSubcategory?: Resolver<Maybe<ResolversTypes['CrudResponseCreate']>, ParentType, ContextType, RequireFields<MutationCreateNetWorthSubcategoryArgs, 'input'>>;
  createReceipt?: Resolver<Maybe<ResolversTypes['ReceiptCreated']>, ParentType, ContextType, RequireFields<MutationCreateReceiptArgs, 'date' | 'shop' | 'items'>>;
  deleteFund?: Resolver<Maybe<ResolversTypes['CrudResponseDelete']>, ParentType, ContextType, RequireFields<MutationDeleteFundArgs, 'id'>>;
  deleteListItem?: Resolver<Maybe<ResolversTypes['CrudResponseDelete']>, ParentType, ContextType, RequireFields<MutationDeleteListItemArgs, 'page' | 'id'>>;
  deleteNetWorthCategory?: Resolver<Maybe<ResolversTypes['CrudResponseDelete']>, ParentType, ContextType, RequireFields<MutationDeleteNetWorthCategoryArgs, 'id'>>;
  deleteNetWorthEntry?: Resolver<Maybe<ResolversTypes['CrudResponseDelete']>, ParentType, ContextType, RequireFields<MutationDeleteNetWorthEntryArgs, 'id'>>;
  deleteNetWorthSubcategory?: Resolver<Maybe<ResolversTypes['CrudResponseDelete']>, ParentType, ContextType, RequireFields<MutationDeleteNetWorthSubcategoryArgs, 'id'>>;
  login?: Resolver<ResolversTypes['LoginResponse'], ParentType, ContextType, RequireFields<MutationLoginArgs, 'pin'>>;
  logout?: Resolver<ResolversTypes['LogoutResponse'], ParentType, ContextType>;
  setConfig?: Resolver<Maybe<ResolversTypes['AppConfigSet']>, ParentType, ContextType, RequireFields<MutationSetConfigArgs, 'config'>>;
  setInvestmentBucket?: Resolver<Maybe<ResolversTypes['SetInvestmentBucketResponse']>, ParentType, ContextType, RequireFields<MutationSetInvestmentBucketArgs, 'value'>>;
  updateCashAllocationTarget?: Resolver<Maybe<ResolversTypes['CrudResponseUpdate']>, ParentType, ContextType, RequireFields<MutationUpdateCashAllocationTargetArgs, 'target'>>;
  updateFund?: Resolver<Maybe<ResolversTypes['CrudResponseUpdate']>, ParentType, ContextType, RequireFields<MutationUpdateFundArgs, 'id' | 'input'>>;
  updateFundAllocationTargets?: Resolver<Maybe<ResolversTypes['UpdatedFundAllocationTargets']>, ParentType, ContextType, RequireFields<MutationUpdateFundAllocationTargetsArgs, 'deltas'>>;
  updateListItem?: Resolver<Maybe<ResolversTypes['CrudResponseUpdate']>, ParentType, ContextType, RequireFields<MutationUpdateListItemArgs, 'page' | 'id' | 'input'>>;
  updateNetWorthCategory?: Resolver<Maybe<ResolversTypes['CrudResponseUpdate']>, ParentType, ContextType, RequireFields<MutationUpdateNetWorthCategoryArgs, 'id' | 'input'>>;
  updateNetWorthEntry?: Resolver<Maybe<ResolversTypes['CrudResponseUpdate']>, ParentType, ContextType, RequireFields<MutationUpdateNetWorthEntryArgs, 'id' | 'input'>>;
  updateNetWorthSubcategory?: Resolver<Maybe<ResolversTypes['CrudResponseUpdate']>, ParentType, ContextType, RequireFields<MutationUpdateNetWorthSubcategoryArgs, 'id' | 'input'>>;
  upsertBucket?: Resolver<Maybe<ResolversTypes['UpsertBucketResponse']>, ParentType, ContextType, RequireFields<MutationUpsertBucketArgs, 'startDate' | 'endDate' | 'id' | 'bucket'>>;
};

export type NetWorthCashTotalResolvers<ContextType = Context, ParentType extends ResolversParentTypes['NetWorthCashTotal'] = ResolversParentTypes['NetWorthCashTotal']> = {
  cashInBank?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  stockValue?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  stocksIncludingCash?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  date?: Resolver<Maybe<ResolversTypes['Date']>, ParentType, ContextType>;
  incomeSince?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  spendingSince?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type NetWorthCategoryResolvers<ContextType = Context, ParentType extends ResolversParentTypes['NetWorthCategory'] = ResolversParentTypes['NetWorthCategory']> = {
  id?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  type?: Resolver<ResolversTypes['NetWorthCategoryType'], ParentType, ContextType>;
  category?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  color?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  isOption?: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type NetWorthCategoryCreatedResolvers<ContextType = Context, ParentType extends ResolversParentTypes['NetWorthCategoryCreated'] = ResolversParentTypes['NetWorthCategoryCreated']> = {
  error?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  item?: Resolver<Maybe<ResolversTypes['NetWorthCategory']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type NetWorthCategoryUpdatedResolvers<ContextType = Context, ParentType extends ResolversParentTypes['NetWorthCategoryUpdated'] = ResolversParentTypes['NetWorthCategoryUpdated']> = {
  error?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  item?: Resolver<Maybe<ResolversTypes['NetWorthCategory']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type NetWorthDeletedResolvers<ContextType = Context, ParentType extends ResolversParentTypes['NetWorthDeleted'] = ResolversParentTypes['NetWorthDeleted']> = {
  error?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  id?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type NetWorthEntryResolvers<ContextType = Context, ParentType extends ResolversParentTypes['NetWorthEntry'] = ResolversParentTypes['NetWorthEntry']> = {
  id?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  date?: Resolver<ResolversTypes['Date'], ParentType, ContextType>;
  values?: Resolver<Array<ResolversTypes['NetWorthValueObject']>, ParentType, ContextType>;
  creditLimit?: Resolver<Array<ResolversTypes['CreditLimit']>, ParentType, ContextType>;
  currencies?: Resolver<Array<ResolversTypes['Currency']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type NetWorthEntryCreatedResolvers<ContextType = Context, ParentType extends ResolversParentTypes['NetWorthEntryCreated'] = ResolversParentTypes['NetWorthEntryCreated']> = {
  error?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  item?: Resolver<Maybe<ResolversTypes['NetWorthEntry']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type NetWorthEntryOverviewResolvers<ContextType = Context, ParentType extends ResolversParentTypes['NetWorthEntryOverview'] = ResolversParentTypes['NetWorthEntryOverview']> = {
  current?: Resolver<Array<ResolversTypes['NetWorthEntry']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type NetWorthEntryUpdatedResolvers<ContextType = Context, ParentType extends ResolversParentTypes['NetWorthEntryUpdated'] = ResolversParentTypes['NetWorthEntryUpdated']> = {
  error?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  item?: Resolver<Maybe<ResolversTypes['NetWorthEntry']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type NetWorthLoanResolvers<ContextType = Context, ParentType extends ResolversParentTypes['NetWorthLoan'] = ResolversParentTypes['NetWorthLoan']> = {
  subcategory?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  values?: Resolver<Array<ResolversTypes['NetWorthLoanValue']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type NetWorthLoanValueResolvers<ContextType = Context, ParentType extends ResolversParentTypes['NetWorthLoanValue'] = ResolversParentTypes['NetWorthLoanValue']> = {
  date?: Resolver<ResolversTypes['Date'], ParentType, ContextType>;
  value?: Resolver<ResolversTypes['LoanValue'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type NetWorthLoansResponseResolvers<ContextType = Context, ParentType extends ResolversParentTypes['NetWorthLoansResponse'] = ResolversParentTypes['NetWorthLoansResponse']> = {
  error?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  loans?: Resolver<Maybe<Array<ResolversTypes['NetWorthLoan']>>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type NetWorthSubcategoryResolvers<ContextType = Context, ParentType extends ResolversParentTypes['NetWorthSubcategory'] = ResolversParentTypes['NetWorthSubcategory']> = {
  id?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  categoryId?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  subcategory?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  hasCreditLimit?: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
  appreciationRate?: Resolver<Maybe<ResolversTypes['Float']>, ParentType, ContextType>;
  isSAYE?: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
  opacity?: Resolver<Maybe<ResolversTypes['Float']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type NetWorthSubcategoryCreatedResolvers<ContextType = Context, ParentType extends ResolversParentTypes['NetWorthSubcategoryCreated'] = ResolversParentTypes['NetWorthSubcategoryCreated']> = {
  error?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  item?: Resolver<Maybe<ResolversTypes['NetWorthSubcategory']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type NetWorthSubcategoryUpdatedResolvers<ContextType = Context, ParentType extends ResolversParentTypes['NetWorthSubcategoryUpdated'] = ResolversParentTypes['NetWorthSubcategoryUpdated']> = {
  error?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  item?: Resolver<Maybe<ResolversTypes['NetWorthSubcategory']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type NetWorthValueObjectResolvers<ContextType = Context, ParentType extends ResolversParentTypes['NetWorthValueObject'] = ResolversParentTypes['NetWorthValueObject']> = {
  subcategory?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  skip?: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
  value?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  simple?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  fx?: Resolver<Maybe<Array<ResolversTypes['FXValue']>>, ParentType, ContextType>;
  option?: Resolver<Maybe<ResolversTypes['OptionValue']>, ParentType, ContextType>;
  loan?: Resolver<Maybe<ResolversTypes['LoanValue']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export interface NonNegativeFloatScalarConfig extends GraphQLScalarTypeConfig<ResolversTypes['NonNegativeFloat'], any> {
  name: 'NonNegativeFloat';
}

export interface NonNegativeIntScalarConfig extends GraphQLScalarTypeConfig<ResolversTypes['NonNegativeInt'], any> {
  name: 'NonNegativeInt';
}

export type OptionValueResolvers<ContextType = Context, ParentType extends ResolversParentTypes['OptionValue'] = ResolversParentTypes['OptionValue']> = {
  units?: Resolver<ResolversTypes['NonNegativeInt'], ParentType, ContextType>;
  strikePrice?: Resolver<ResolversTypes['NonNegativeFloat'], ParentType, ContextType>;
  marketPrice?: Resolver<ResolversTypes['NonNegativeFloat'], ParentType, ContextType>;
  vested?: Resolver<ResolversTypes['NonNegativeInt'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type OverviewResolvers<ContextType = Context, ParentType extends ResolversParentTypes['Overview'] = ResolversParentTypes['Overview']> = {
  startDate?: Resolver<ResolversTypes['Date'], ParentType, ContextType>;
  endDate?: Resolver<ResolversTypes['Date'], ParentType, ContextType>;
  monthly?: Resolver<ResolversTypes['Monthly'], ParentType, ContextType>;
  initialCumulativeValues?: Resolver<ResolversTypes['InitialCumulativeValues'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type OverviewOldResolvers<ContextType = Context, ParentType extends ResolversParentTypes['OverviewOld'] = ResolversParentTypes['OverviewOld']> = {
  startDate?: Resolver<ResolversTypes['Date'], ParentType, ContextType>;
  assets?: Resolver<Array<ResolversTypes['Int']>, ParentType, ContextType>;
  liabilities?: Resolver<Array<ResolversTypes['Int']>, ParentType, ContextType>;
  netWorth?: Resolver<Array<ResolversTypes['Int']>, ParentType, ContextType>;
  stocks?: Resolver<Array<ResolversTypes['Int']>, ParentType, ContextType>;
  investmentPurchases?: Resolver<Array<ResolversTypes['Int']>, ParentType, ContextType>;
  pension?: Resolver<Array<ResolversTypes['Int']>, ParentType, ContextType>;
  cashLiquid?: Resolver<Array<ResolversTypes['Int']>, ParentType, ContextType>;
  cashOther?: Resolver<Array<ResolversTypes['Int']>, ParentType, ContextType>;
  investments?: Resolver<Array<ResolversTypes['Int']>, ParentType, ContextType>;
  illiquidEquity?: Resolver<Array<ResolversTypes['Int']>, ParentType, ContextType>;
  options?: Resolver<Array<ResolversTypes['Int']>, ParentType, ContextType>;
  income?: Resolver<Array<ResolversTypes['Int']>, ParentType, ContextType>;
  spending?: Resolver<Array<ResolversTypes['Int']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type OverviewPreviewResolvers<ContextType = Context, ParentType extends ResolversParentTypes['OverviewPreview'] = ResolversParentTypes['OverviewPreview']> = {
  startDate?: Resolver<ResolversTypes['Date'], ParentType, ContextType>;
  values?: Resolver<Array<ResolversTypes['Int']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export interface PositiveIntScalarConfig extends GraphQLScalarTypeConfig<ResolversTypes['PositiveInt'], any> {
  name: 'PositiveInt';
}

export type QueryResolvers<ContextType = Context, ParentType extends ResolversParentTypes['Query'] = ResolversParentTypes['Query']> = {
  analysis?: Resolver<Maybe<ResolversTypes['AnalysisResponse']>, ParentType, ContextType, RequireFields<QueryAnalysisArgs, 'period' | 'groupBy'>>;
  analysisDeep?: Resolver<Maybe<Array<ResolversTypes['CategoryCostTreeDeep']>>, ParentType, ContextType, RequireFields<QueryAnalysisDeepArgs, 'category' | 'period' | 'groupBy'>>;
  cashAllocationTarget?: Resolver<Maybe<ResolversTypes['NonNegativeInt']>, ParentType, ContextType>;
  config?: Resolver<Maybe<ResolversTypes['AppConfig']>, ParentType, ContextType>;
  exchangeRates?: Resolver<Maybe<ResolversTypes['ExchangeRatesResponse']>, ParentType, ContextType, RequireFields<QueryExchangeRatesArgs, 'base'>>;
  fundHistory?: Resolver<Maybe<ResolversTypes['FundHistory']>, ParentType, ContextType, RequireFields<QueryFundHistoryArgs, never>>;
  fundHistoryIndividual?: Resolver<Maybe<ResolversTypes['FundHistoryIndividual']>, ParentType, ContextType, RequireFields<QueryFundHistoryIndividualArgs, 'id'>>;
  listBuckets?: Resolver<Maybe<ResolversTypes['ListBucketsResponse']>, ParentType, ContextType, RequireFields<QueryListBucketsArgs, 'startDate' | 'endDate'>>;
  netWorthCashTotal?: Resolver<Maybe<ResolversTypes['NetWorthCashTotal']>, ParentType, ContextType>;
  netWorthLoans?: Resolver<Maybe<ResolversTypes['NetWorthLoansResponse']>, ParentType, ContextType>;
  overview?: Resolver<Maybe<ResolversTypes['Overview']>, ParentType, ContextType, RequireFields<QueryOverviewArgs, never>>;
  overviewOld?: Resolver<Maybe<ResolversTypes['OverviewOld']>, ParentType, ContextType, RequireFields<QueryOverviewOldArgs, never>>;
  overviewPreview?: Resolver<Maybe<ResolversTypes['OverviewPreview']>, ParentType, ContextType, RequireFields<QueryOverviewPreviewArgs, 'category' | 'date'>>;
  readFunds?: Resolver<Maybe<ResolversTypes['ReadFundsResponse']>, ParentType, ContextType>;
  readList?: Resolver<Maybe<ResolversTypes['ListReadResponse']>, ParentType, ContextType, RequireFields<QueryReadListArgs, 'page'>>;
  readNetWorthCategories?: Resolver<Maybe<Array<ResolversTypes['NetWorthCategory']>>, ParentType, ContextType, RequireFields<QueryReadNetWorthCategoriesArgs, never>>;
  readNetWorthEntries?: Resolver<Maybe<ResolversTypes['NetWorthEntryOverview']>, ParentType, ContextType>;
  readNetWorthSubcategories?: Resolver<Maybe<Array<ResolversTypes['NetWorthSubcategory']>>, ParentType, ContextType, RequireFields<QueryReadNetWorthSubcategoriesArgs, never>>;
  receiptItem?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType, RequireFields<QueryReceiptItemArgs, 'item'>>;
  receiptItems?: Resolver<Maybe<Array<ResolversTypes['ReceiptCategory']>>, ParentType, ContextType, RequireFields<QueryReceiptItemsArgs, 'items'>>;
  search?: Resolver<Maybe<ResolversTypes['SearchResult']>, ParentType, ContextType, RequireFields<QuerySearchArgs, 'page' | 'column' | 'searchTerm'>>;
  stockPrices?: Resolver<Maybe<ResolversTypes['StockPricesResponse']>, ParentType, ContextType, RequireFields<QueryStockPricesArgs, 'codes'>>;
  whoami?: Resolver<Maybe<ResolversTypes['UserInfo']>, ParentType, ContextType>;
};

export type ReadFundsResponseResolvers<ContextType = Context, ParentType extends ResolversParentTypes['ReadFundsResponse'] = ResolversParentTypes['ReadFundsResponse']> = {
  items?: Resolver<Array<ResolversTypes['Fund']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type ReceiptCategoryResolvers<ContextType = Context, ParentType extends ResolversParentTypes['ReceiptCategory'] = ResolversParentTypes['ReceiptCategory']> = {
  item?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  page?: Resolver<ResolversTypes['ReceiptPage'], ParentType, ContextType>;
  category?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type ReceiptCreatedResolvers<ContextType = Context, ParentType extends ResolversParentTypes['ReceiptCreated'] = ResolversParentTypes['ReceiptCreated']> = {
  error?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  items?: Resolver<Maybe<Array<ResolversTypes['ReceiptItem']>>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type ReceiptItemResolvers<ContextType = Context, ParentType extends ResolversParentTypes['ReceiptItem'] = ResolversParentTypes['ReceiptItem']> = {
  page?: Resolver<ResolversTypes['ReceiptPage'], ParentType, ContextType>;
  id?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  date?: Resolver<ResolversTypes['Date'], ParentType, ContextType>;
  item?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  category?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  cost?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  shop?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type SearchResultResolvers<ContextType = Context, ParentType extends ResolversParentTypes['SearchResult'] = ResolversParentTypes['SearchResult']> = {
  error?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  searchTerm?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  list?: Resolver<Array<ResolversTypes['String']>, ParentType, ContextType>;
  nextCategory?: Resolver<Maybe<Array<ResolversTypes['String']>>, ParentType, ContextType>;
  nextField?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type SetInvestmentBucketResponseResolvers<ContextType = Context, ParentType extends ResolversParentTypes['SetInvestmentBucketResponse'] = ResolversParentTypes['SetInvestmentBucketResponse']> = {
  expectedValue?: Resolver<Maybe<ResolversTypes['NonNegativeInt']>, ParentType, ContextType>;
  error?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type SimpleValueResolvers<ContextType = Context, ParentType extends ResolversParentTypes['SimpleValue'] = ResolversParentTypes['SimpleValue']> = {
  value?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type StockPriceResolvers<ContextType = Context, ParentType extends ResolversParentTypes['StockPrice'] = ResolversParentTypes['StockPrice']> = {
  code?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  price?: Resolver<Maybe<ResolversTypes['NonNegativeFloat']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type StockPricesResponseResolvers<ContextType = Context, ParentType extends ResolversParentTypes['StockPricesResponse'] = ResolversParentTypes['StockPricesResponse']> = {
  error?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  prices?: Resolver<Array<ResolversTypes['StockPrice']>, ParentType, ContextType>;
  refreshTime?: Resolver<Maybe<ResolversTypes['DateTime']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type StockSplitResolvers<ContextType = Context, ParentType extends ResolversParentTypes['StockSplit'] = ResolversParentTypes['StockSplit']> = {
  date?: Resolver<ResolversTypes['Date'], ParentType, ContextType>;
  ratio?: Resolver<ResolversTypes['NonNegativeFloat'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type SubscriptionResolvers<ContextType = Context, ParentType extends ResolversParentTypes['Subscription'] = ResolversParentTypes['Subscription']> = {
  cashAllocationTargetUpdated?: SubscriptionResolver<ResolversTypes['NonNegativeInt'], "cashAllocationTargetUpdated", ParentType, ContextType>;
  configUpdated?: SubscriptionResolver<ResolversTypes['AppConfig'], "configUpdated", ParentType, ContextType>;
  fundAllocationTargetsUpdated?: SubscriptionResolver<ResolversTypes['UpdatedFundAllocationTargets'], "fundAllocationTargetsUpdated", ParentType, ContextType>;
  fundCreated?: SubscriptionResolver<ResolversTypes['FundCreateUpdate'], "fundCreated", ParentType, ContextType>;
  fundDeleted?: SubscriptionResolver<ResolversTypes['FundDelete'], "fundDeleted", ParentType, ContextType>;
  fundPricesUpdated?: SubscriptionResolver<Maybe<ResolversTypes['FundHistory']>, "fundPricesUpdated", ParentType, ContextType, RequireFields<SubscriptionFundPricesUpdatedArgs, never>>;
  fundUpdated?: SubscriptionResolver<ResolversTypes['FundCreateUpdate'], "fundUpdated", ParentType, ContextType>;
  listItemCreated?: SubscriptionResolver<ResolversTypes['ListItemCreateUpdate'], "listItemCreated", ParentType, ContextType, RequireFields<SubscriptionListItemCreatedArgs, 'pages'>>;
  listItemDeleted?: SubscriptionResolver<ResolversTypes['ListItemDelete'], "listItemDeleted", ParentType, ContextType>;
  listItemUpdated?: SubscriptionResolver<ResolversTypes['ListItemCreateUpdate'], "listItemUpdated", ParentType, ContextType, RequireFields<SubscriptionListItemUpdatedArgs, 'pages'>>;
  netWorthCashTotalUpdated?: SubscriptionResolver<ResolversTypes['NetWorthCashTotal'], "netWorthCashTotalUpdated", ParentType, ContextType>;
  netWorthCategoryCreated?: SubscriptionResolver<ResolversTypes['NetWorthCategoryCreated'], "netWorthCategoryCreated", ParentType, ContextType>;
  netWorthCategoryDeleted?: SubscriptionResolver<ResolversTypes['NetWorthDeleted'], "netWorthCategoryDeleted", ParentType, ContextType>;
  netWorthCategoryUpdated?: SubscriptionResolver<ResolversTypes['NetWorthCategoryUpdated'], "netWorthCategoryUpdated", ParentType, ContextType>;
  netWorthEntryCreated?: SubscriptionResolver<ResolversTypes['NetWorthEntryCreated'], "netWorthEntryCreated", ParentType, ContextType>;
  netWorthEntryDeleted?: SubscriptionResolver<ResolversTypes['NetWorthDeleted'], "netWorthEntryDeleted", ParentType, ContextType>;
  netWorthEntryUpdated?: SubscriptionResolver<ResolversTypes['NetWorthEntryUpdated'], "netWorthEntryUpdated", ParentType, ContextType>;
  netWorthSubcategoryCreated?: SubscriptionResolver<ResolversTypes['NetWorthSubcategoryCreated'], "netWorthSubcategoryCreated", ParentType, ContextType>;
  netWorthSubcategoryDeleted?: SubscriptionResolver<ResolversTypes['NetWorthDeleted'], "netWorthSubcategoryDeleted", ParentType, ContextType>;
  netWorthSubcategoryUpdated?: SubscriptionResolver<ResolversTypes['NetWorthSubcategoryUpdated'], "netWorthSubcategoryUpdated", ParentType, ContextType>;
  receiptCreated?: SubscriptionResolver<ResolversTypes['ReceiptCreated'], "receiptCreated", ParentType, ContextType>;
};

export type TargetDeltaResponseResolvers<ContextType = Context, ParentType extends ResolversParentTypes['TargetDeltaResponse'] = ResolversParentTypes['TargetDeltaResponse']> = {
  id?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  allocationTarget?: Resolver<ResolversTypes['NonNegativeInt'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type TransactionResolvers<ContextType = Context, ParentType extends ResolversParentTypes['Transaction'] = ResolversParentTypes['Transaction']> = {
  date?: Resolver<ResolversTypes['Date'], ParentType, ContextType>;
  units?: Resolver<ResolversTypes['Float'], ParentType, ContextType>;
  price?: Resolver<ResolversTypes['NonNegativeFloat'], ParentType, ContextType>;
  fees?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  taxes?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  drip?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type UpdatedFundAllocationTargetsResolvers<ContextType = Context, ParentType extends ResolversParentTypes['UpdatedFundAllocationTargets'] = ResolversParentTypes['UpdatedFundAllocationTargets']> = {
  error?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  deltas?: Resolver<Maybe<Array<ResolversTypes['TargetDeltaResponse']>>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type UpsertBucketResponseResolvers<ContextType = Context, ParentType extends ResolversParentTypes['UpsertBucketResponse'] = ResolversParentTypes['UpsertBucketResponse']> = {
  buckets?: Resolver<Maybe<Array<ResolversTypes['Bucket']>>, ParentType, ContextType>;
  error?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type UserResolvers<ContextType = Context, ParentType extends ResolversParentTypes['User'] = ResolversParentTypes['User']> = {
  uid?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type UserInfoResolvers<ContextType = Context, ParentType extends ResolversParentTypes['UserInfo'] = ResolversParentTypes['UserInfo']> = {
  uid?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  name?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type Resolvers<ContextType = Context> = {
  AnalysisResponse?: AnalysisResponseResolvers<ContextType>;
  AppConfig?: AppConfigResolvers<ContextType>;
  AppConfigSet?: AppConfigSetResolvers<ContextType>;
  Bucket?: BucketResolvers<ContextType>;
  CategoryCostTree?: CategoryCostTreeResolvers<ContextType>;
  CategoryCostTreeDeep?: CategoryCostTreeDeepResolvers<ContextType>;
  CategoryTreeItem?: CategoryTreeItemResolvers<ContextType>;
  CreditLimit?: CreditLimitResolvers<ContextType>;
  CrudResponseCreate?: CrudResponseCreateResolvers<ContextType>;
  CrudResponseDelete?: CrudResponseDeleteResolvers<ContextType>;
  CrudResponseUpdate?: CrudResponseUpdateResolvers<ContextType>;
  Currency?: CurrencyResolvers<ContextType>;
  Date?: GraphQLScalarType;
  DateTime?: GraphQLScalarType;
  ExchangeRate?: ExchangeRateResolvers<ContextType>;
  ExchangeRatesResponse?: ExchangeRatesResponseResolvers<ContextType>;
  FXValue?: FxValueResolvers<ContextType>;
  Fund?: FundResolvers<ContextType>;
  FundCreateUpdate?: FundCreateUpdateResolvers<ContextType>;
  FundData?: FundDataResolvers<ContextType>;
  FundDelete?: FundDeleteResolvers<ContextType>;
  FundHistory?: FundHistoryResolvers<ContextType>;
  FundHistoryIndividual?: FundHistoryIndividualResolvers<ContextType>;
  FundPriceGroup?: FundPriceGroupResolvers<ContextType>;
  FundPrices?: FundPricesResolvers<ContextType>;
  FundValueIndividual?: FundValueIndividualResolvers<ContextType>;
  InitialCumulativeValues?: InitialCumulativeValuesResolvers<ContextType>;
  InvestmentBucket?: InvestmentBucketResolvers<ContextType>;
  InvestmentBucketInput?: InvestmentBucketInputResolvers<ContextType>;
  ListBucketsResponse?: ListBucketsResponseResolvers<ContextType>;
  ListItem?: ListItemResolvers<ContextType>;
  ListItemCreateUpdate?: ListItemCreateUpdateResolvers<ContextType>;
  ListItemDelete?: ListItemDeleteResolvers<ContextType>;
  ListItemStandard?: ListItemStandardResolvers<ContextType>;
  ListItemStandardSubscription?: ListItemStandardSubscriptionResolvers<ContextType>;
  ListReadResponse?: ListReadResponseResolvers<ContextType>;
  ListTotalsResponse?: ListTotalsResponseResolvers<ContextType>;
  LoanValue?: LoanValueResolvers<ContextType>;
  LoginResponse?: LoginResponseResolvers<ContextType>;
  LogoutResponse?: LogoutResponseResolvers<ContextType>;
  Monthly?: MonthlyResolvers<ContextType>;
  Mutation?: MutationResolvers<ContextType>;
  NetWorthCashTotal?: NetWorthCashTotalResolvers<ContextType>;
  NetWorthCategory?: NetWorthCategoryResolvers<ContextType>;
  NetWorthCategoryCreated?: NetWorthCategoryCreatedResolvers<ContextType>;
  NetWorthCategoryUpdated?: NetWorthCategoryUpdatedResolvers<ContextType>;
  NetWorthDeleted?: NetWorthDeletedResolvers<ContextType>;
  NetWorthEntry?: NetWorthEntryResolvers<ContextType>;
  NetWorthEntryCreated?: NetWorthEntryCreatedResolvers<ContextType>;
  NetWorthEntryOverview?: NetWorthEntryOverviewResolvers<ContextType>;
  NetWorthEntryUpdated?: NetWorthEntryUpdatedResolvers<ContextType>;
  NetWorthLoan?: NetWorthLoanResolvers<ContextType>;
  NetWorthLoanValue?: NetWorthLoanValueResolvers<ContextType>;
  NetWorthLoansResponse?: NetWorthLoansResponseResolvers<ContextType>;
  NetWorthSubcategory?: NetWorthSubcategoryResolvers<ContextType>;
  NetWorthSubcategoryCreated?: NetWorthSubcategoryCreatedResolvers<ContextType>;
  NetWorthSubcategoryUpdated?: NetWorthSubcategoryUpdatedResolvers<ContextType>;
  NetWorthValueObject?: NetWorthValueObjectResolvers<ContextType>;
  NonNegativeFloat?: GraphQLScalarType;
  NonNegativeInt?: GraphQLScalarType;
  OptionValue?: OptionValueResolvers<ContextType>;
  Overview?: OverviewResolvers<ContextType>;
  OverviewOld?: OverviewOldResolvers<ContextType>;
  OverviewPreview?: OverviewPreviewResolvers<ContextType>;
  PositiveInt?: GraphQLScalarType;
  Query?: QueryResolvers<ContextType>;
  ReadFundsResponse?: ReadFundsResponseResolvers<ContextType>;
  ReceiptCategory?: ReceiptCategoryResolvers<ContextType>;
  ReceiptCreated?: ReceiptCreatedResolvers<ContextType>;
  ReceiptItem?: ReceiptItemResolvers<ContextType>;
  SearchResult?: SearchResultResolvers<ContextType>;
  SetInvestmentBucketResponse?: SetInvestmentBucketResponseResolvers<ContextType>;
  SimpleValue?: SimpleValueResolvers<ContextType>;
  StockPrice?: StockPriceResolvers<ContextType>;
  StockPricesResponse?: StockPricesResponseResolvers<ContextType>;
  StockSplit?: StockSplitResolvers<ContextType>;
  Subscription?: SubscriptionResolvers<ContextType>;
  TargetDeltaResponse?: TargetDeltaResponseResolvers<ContextType>;
  Transaction?: TransactionResolvers<ContextType>;
  UpdatedFundAllocationTargets?: UpdatedFundAllocationTargetsResolvers<ContextType>;
  UpsertBucketResponse?: UpsertBucketResponseResolvers<ContextType>;
  User?: UserResolvers<ContextType>;
  UserInfo?: UserInfoResolvers<ContextType>;
};


/**
 * @deprecated
 * Use "Resolvers" root object instead. If you wish to get "IResolvers", add "typesPrefix: I" to your config.
 */
export type IResolvers<ContextType = Context> = Resolvers<ContextType>;
