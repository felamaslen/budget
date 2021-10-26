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
  Bills = 'bills',
  Food = 'food',
  General = 'general',
  Holiday = 'holiday',
  Income = 'income',
  Social = 'social'
}

export enum AnalysisPeriod {
  Month = 'month',
  Week = 'week',
  Year = 'year'
}

export type AnalysisResponse = {
  cost: Array<CategoryCostTree>;
  description: Scalars['String'];
  endDate: Scalars['Date'];
  startDate: Scalars['Date'];
};

export type AppConfig = {
  birthDate: Scalars['String'];
  fundLength?: Maybe<Scalars['NonNegativeInt']>;
  fundMode?: Maybe<FundMode>;
  fundPeriod?: Maybe<FundPeriod>;
  futureMonths: Scalars['Int'];
  realTimePrices: Scalars['Boolean'];
};

export type AppConfigInput = {
  birthDate?: Maybe<Scalars['Date']>;
  fundLength?: Maybe<Scalars['NonNegativeInt']>;
  fundMode?: Maybe<FundMode>;
  fundPeriod?: Maybe<FundPeriod>;
  futureMonths?: Maybe<Scalars['Int']>;
  realTimePrices?: Maybe<Scalars['Boolean']>;
};

export type AppConfigSet = {
  config?: Maybe<AppConfig>;
  error?: Maybe<Scalars['String']>;
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

export type Fund = {
  allocationTarget?: Maybe<Scalars['NonNegativeInt']>;
  id: Scalars['Int'];
  item: Scalars['String'];
  stockSplits: Array<StockSplit>;
  transactions: Array<Transaction>;
};

export type FundCreatedSubscription = {
  fakeId: Scalars['Int'];
  item: Fund;
};

export type FundHistory = {
  annualisedFundReturns: Scalars['Float'];
  cacheTimes: Array<Scalars['Int']>;
  overviewCost: Array<Scalars['Int']>;
  prices: Array<FundPrices>;
  startTime: Scalars['Int'];
};

export type FundHistoryIndividual = {
  values: Array<FundValueIndividual>;
};

export type FundInput = {
  allocationTarget?: Maybe<Scalars['NonNegativeInt']>;
  item: Scalars['String'];
  stockSplits?: Maybe<Array<StockSplitInput>>;
  transactions: Array<TransactionInput>;
};

export enum FundMode {
  Allocation = 'Allocation',
  Price = 'Price',
  PriceNormalised = 'PriceNormalised',
  Roi = 'ROI',
  Stacked = 'Stacked',
  Value = 'Value'
}

export enum FundPeriod {
  Month = 'month',
  Year = 'year',
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

export type FundSubscription = {
  created?: Maybe<FundCreatedSubscription>;
  deleted?: Maybe<Scalars['NonNegativeInt']>;
  overviewCost: Array<Scalars['Int']>;
  updated?: Maybe<Fund>;
};

export type FundValueIndividual = {
  date: Scalars['Int'];
  price: Scalars['NonNegativeFloat'];
};

export type FxValue = {
  currency: Scalars['String'];
  value: Scalars['Float'];
};

export type FxValueInput = {
  currency: Scalars['String'];
  value: Scalars['Float'];
};

export type Income = {
  category: Scalars['String'];
  cost: Scalars['Int'];
  date: Scalars['Date'];
  deductions: Array<IncomeDeduction>;
  id: Scalars['Int'];
  item: Scalars['String'];
  shop: Scalars['String'];
};

export type IncomeCreatedSubscription = {
  fakeId: Scalars['Int'];
  item: Income;
};

export type IncomeDeduction = {
  name: Scalars['String'];
  value: Scalars['Int'];
};

export type IncomeDeductionInput = {
  name: Scalars['String'];
  value: Scalars['Int'];
};

export type IncomeInput = {
  category: Scalars['String'];
  cost: Scalars['Int'];
  date: Scalars['String'];
  deductions: Array<IncomeDeductionInput>;
  item: Scalars['String'];
  shop: Scalars['String'];
};

export type IncomeReadResponse = {
  error?: Maybe<Scalars['String']>;
  items: Array<Income>;
  olderExists?: Maybe<Scalars['Boolean']>;
  total?: Maybe<IncomeTotals>;
  weekly?: Maybe<Scalars['Int']>;
};

export type IncomeSubscription = {
  created?: Maybe<IncomeCreatedSubscription>;
  deleted?: Maybe<Scalars['NonNegativeInt']>;
  overviewCost: Array<Scalars['Int']>;
  total?: Maybe<IncomeTotals>;
  updated?: Maybe<Income>;
  weekly?: Maybe<Scalars['Int']>;
};

export type IncomeTotals = {
  deductions: Array<IncomeDeduction>;
  gross: Scalars['Int'];
};

export type InitialCumulativeValues = {
  income: Scalars['Int'];
  spending: Scalars['Int'];
};

export type ListItem = {
  id: Scalars['Int'];
  item: Scalars['String'];
};

export type ListItemInput = {
  fakeId?: Maybe<Scalars['Int']>;
  item: Scalars['String'];
};

export type ListItemStandard = {
  category: Scalars['String'];
  cost: Scalars['Int'];
  date: Scalars['Date'];
  id: Scalars['Int'];
  item: Scalars['String'];
  shop: Scalars['String'];
};

export type ListItemStandardCreatedSubscription = {
  fakeId: Scalars['Int'];
  item: ListItemStandard;
};

export type ListItemStandardInput = {
  category: Scalars['String'];
  cost: Scalars['Int'];
  date: Scalars['String'];
  item: Scalars['String'];
  shop: Scalars['String'];
};

export type ListReadResponse = {
  error?: Maybe<Scalars['String']>;
  items: Array<ListItemStandard>;
  olderExists?: Maybe<Scalars['Boolean']>;
  total?: Maybe<Scalars['Int']>;
  weekly?: Maybe<Scalars['Int']>;
};

export type ListSubscription = {
  created?: Maybe<ListItemStandardCreatedSubscription>;
  deleted?: Maybe<Scalars['NonNegativeInt']>;
  overviewCost: Array<Scalars['Int']>;
  page: PageListStandard;
  total?: Maybe<Scalars['Int']>;
  updated?: Maybe<ListItemStandard>;
  weekly?: Maybe<Scalars['Int']>;
};

export type ListTotalsResponse = {
  error?: Maybe<Scalars['String']>;
  total?: Maybe<Scalars['Int']>;
  weekly?: Maybe<Scalars['Int']>;
};

export type LoanValue = {
  paid?: Maybe<Scalars['Int']>;
  paymentsRemaining: Scalars['NonNegativeInt'];
  principal: Scalars['NonNegativeInt'];
  rate: Scalars['Float'];
};

export type LoanValueInput = {
  paid?: Maybe<Scalars['Int']>;
  paymentsRemaining: Scalars['NonNegativeInt'];
  principal: Scalars['NonNegativeInt'];
  rate: Scalars['Float'];
};

export type LoginResponse = {
  apiKey?: Maybe<Scalars['String']>;
  error?: Maybe<Scalars['String']>;
  expires?: Maybe<Scalars['DateTime']>;
  name?: Maybe<Scalars['String']>;
  uid?: Maybe<Scalars['Int']>;
};

export type LogoutResponse = {
  error?: Maybe<Scalars['String']>;
  ok?: Maybe<Scalars['Boolean']>;
};

export type Monthly = {
  bills: Array<Scalars['Int']>;
  food: Array<Scalars['Int']>;
  general: Array<Scalars['Int']>;
  holiday: Array<Scalars['Int']>;
  income: Array<Scalars['Int']>;
  investmentPurchases: Array<Scalars['Int']>;
  social: Array<Scalars['Int']>;
};

export enum MonthlyCategory {
  Bills = 'bills',
  Food = 'food',
  General = 'general',
  Holiday = 'holiday',
  Income = 'income',
  Social = 'social',
  Spending = 'spending',
  Stocks = 'stocks'
}

export type Mutation = {
  createFund?: Maybe<CrudResponseCreate>;
  createIncome?: Maybe<CrudResponseCreate>;
  createListItem?: Maybe<CrudResponseCreate>;
  createNetWorthCategory?: Maybe<CrudResponseCreate>;
  createNetWorthEntry?: Maybe<CrudResponseCreate>;
  createNetWorthSubcategory?: Maybe<CrudResponseCreate>;
  createReceipt?: Maybe<ReceiptCreated>;
  deleteFund?: Maybe<CrudResponseDelete>;
  deleteIncome?: Maybe<CrudResponseDelete>;
  deleteListItem?: Maybe<CrudResponseDelete>;
  deleteNetWorthCategory?: Maybe<CrudResponseDelete>;
  deleteNetWorthEntry?: Maybe<CrudResponseDelete>;
  deleteNetWorthSubcategory?: Maybe<CrudResponseDelete>;
  login: LoginResponse;
  logout: LogoutResponse;
  setConfig?: Maybe<AppConfigSet>;
  syncPlanning?: Maybe<PlanningSyncResponse>;
  updateCashAllocationTarget?: Maybe<CrudResponseUpdate>;
  updateFund?: Maybe<CrudResponseUpdate>;
  updateFundAllocationTargets?: Maybe<UpdatedFundAllocationTargets>;
  updateIncome?: Maybe<CrudResponseUpdate>;
  updateListItem?: Maybe<CrudResponseUpdate>;
  updateNetWorthCategory?: Maybe<CrudResponseUpdate>;
  updateNetWorthEntry?: Maybe<CrudResponseUpdate>;
  updateNetWorthSubcategory?: Maybe<CrudResponseUpdate>;
};


export type MutationCreateFundArgs = {
  fakeId: Scalars['Int'];
  input: FundInput;
};


export type MutationCreateIncomeArgs = {
  fakeId: Scalars['Int'];
  input: IncomeInput;
};


export type MutationCreateListItemArgs = {
  fakeId: Scalars['Int'];
  input: ListItemStandardInput;
  page: PageListStandard;
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
  items: Array<ReceiptInput>;
  shop: Scalars['String'];
};


export type MutationDeleteFundArgs = {
  id: Scalars['Int'];
};


export type MutationDeleteIncomeArgs = {
  id: Scalars['Int'];
};


export type MutationDeleteListItemArgs = {
  id: Scalars['Int'];
  page: PageListStandard;
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


export type MutationSyncPlanningArgs = {
  input?: Maybe<PlanningSync>;
  year: Scalars['NonNegativeInt'];
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


export type MutationUpdateIncomeArgs = {
  id: Scalars['Int'];
  input: IncomeInput;
};


export type MutationUpdateListItemArgs = {
  id: Scalars['Int'];
  input: ListItemStandardInput;
  page: PageListStandard;
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

export type NetWorthCashTotal = {
  cashInBank: Scalars['Int'];
  date?: Maybe<Scalars['Date']>;
  incomeSince: Scalars['Int'];
  spendingSince: Scalars['Int'];
  stocksIncludingCash: Scalars['Int'];
  stockValue: Scalars['Int'];
};

export type NetWorthCategory = {
  category: Scalars['String'];
  color: Scalars['String'];
  id: Scalars['Int'];
  isOption?: Maybe<Scalars['Boolean']>;
  type: NetWorthCategoryType;
};

export type NetWorthCategoryCreated = {
  error?: Maybe<Scalars['String']>;
  item?: Maybe<NetWorthCategory>;
};

export type NetWorthCategoryInput = {
  category: Scalars['String'];
  color: Scalars['String'];
  isOption?: Maybe<Scalars['Boolean']>;
  type: NetWorthCategoryType;
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
  creditLimit: Array<CreditLimit>;
  currencies: Array<Currency>;
  date: Scalars['Date'];
  id: Scalars['Int'];
  values: Array<NetWorthValueObject>;
};

export type NetWorthEntryCreated = {
  error?: Maybe<Scalars['String']>;
  item?: Maybe<NetWorthEntry>;
};

export type NetWorthEntryInput = {
  creditLimit: Array<CreditLimitInput>;
  currencies: Array<CurrencyInput>;
  date: Scalars['Date'];
  values: Array<NetWorthValueInput>;
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

export type NetWorthLoansResponse = {
  error?: Maybe<Scalars['String']>;
  loans?: Maybe<Array<NetWorthLoan>>;
};

export type NetWorthLoanValue = {
  date: Scalars['Date'];
  value: LoanValue;
};

export type NetWorthSubcategory = {
  appreciationRate?: Maybe<Scalars['Float']>;
  categoryId: Scalars['Int'];
  hasCreditLimit?: Maybe<Scalars['Boolean']>;
  id: Scalars['Int'];
  isSAYE?: Maybe<Scalars['Boolean']>;
  opacity?: Maybe<Scalars['Float']>;
  subcategory: Scalars['String'];
};

export type NetWorthSubcategoryCreated = {
  error?: Maybe<Scalars['String']>;
  item?: Maybe<NetWorthSubcategory>;
};

export type NetWorthSubcategoryInput = {
  appreciationRate?: Maybe<Scalars['Float']>;
  categoryId: Scalars['Int'];
  hasCreditLimit?: Maybe<Scalars['Boolean']>;
  isSAYE?: Maybe<Scalars['Boolean']>;
  opacity?: Maybe<Scalars['Float']>;
  subcategory: Scalars['String'];
};

export type NetWorthSubcategoryUpdated = {
  error?: Maybe<Scalars['String']>;
  item?: Maybe<NetWorthSubcategory>;
};

export type NetWorthValueInput = {
  fx?: Maybe<Array<FxValueInput>>;
  loan?: Maybe<LoanValueInput>;
  option?: Maybe<OptionValueInput>;
  simple?: Maybe<Scalars['Int']>;
  skip?: Maybe<Scalars['Boolean']>;
  subcategory: Scalars['Int'];
};

export type NetWorthValueObject = {
  fx?: Maybe<Array<FxValue>>;
  loan?: Maybe<LoanValue>;
  option?: Maybe<OptionValue>;
  simple?: Maybe<Scalars['Int']>;
  skip?: Maybe<Scalars['Boolean']>;
  subcategory: Scalars['Int'];
  value: Scalars['Int'];
};



export type OptionValue = {
  marketPrice: Scalars['NonNegativeFloat'];
  strikePrice: Scalars['NonNegativeFloat'];
  units: Scalars['NonNegativeInt'];
  vested: Scalars['NonNegativeInt'];
};

export type OptionValueInput = {
  marketPrice: Scalars['NonNegativeFloat'];
  strikePrice: Scalars['NonNegativeFloat'];
  units: Scalars['NonNegativeInt'];
  vested?: Maybe<Scalars['NonNegativeInt']>;
};

export type Overview = {
  endDate: Scalars['Date'];
  futureIncome: Array<Scalars['Int']>;
  initialCumulativeValues: InitialCumulativeValues;
  monthly: Monthly;
  startDate: Scalars['Date'];
};

export type OverviewOld = {
  assets: Array<Scalars['Int']>;
  cashLiquid: Array<Scalars['Int']>;
  cashOther: Array<Scalars['Int']>;
  illiquidEquity: Array<Scalars['Int']>;
  income: Array<Scalars['Int']>;
  investmentPurchases: Array<Scalars['Int']>;
  investments: Array<Scalars['Int']>;
  liabilities: Array<Scalars['Int']>;
  netWorth: Array<Scalars['Int']>;
  options: Array<Scalars['Int']>;
  pension: Array<Scalars['Int']>;
  spending: Array<Scalars['Int']>;
  startDate: Scalars['Date'];
  stocks: Array<Scalars['Int']>;
};

export type OverviewPreview = {
  startDate: Scalars['Date'];
  values: Array<Scalars['Int']>;
};

export enum PageListStandard {
  Bills = 'bills',
  Food = 'food',
  General = 'general',
  Holiday = 'holiday',
  Income = 'income',
  Social = 'social'
}

export type PlanningAccount = {
  account: Scalars['String'];
  computedStartValue?: Maybe<Scalars['Int']>;
  computedValues: Array<PlanningComputedValue>;
  creditCards: Array<PlanningCreditCard>;
  id: Scalars['NonNegativeInt'];
  includeBills?: Maybe<Scalars['Boolean']>;
  income: Array<PlanningIncome>;
  lowerLimit?: Maybe<Scalars['Int']>;
  netWorthSubcategoryId: Scalars['NonNegativeInt'];
  upperLimit?: Maybe<Scalars['Int']>;
  values: Array<PlanningValue>;
};

export type PlanningAccountInput = {
  account: Scalars['String'];
  creditCards: Array<PlanningCreditCardInput>;
  id?: Maybe<Scalars['NonNegativeInt']>;
  includeBills?: Maybe<Scalars['Boolean']>;
  income: Array<PlanningIncomeInput>;
  lowerLimit?: Maybe<Scalars['Int']>;
  netWorthSubcategoryId: Scalars['NonNegativeInt'];
  upperLimit?: Maybe<Scalars['Int']>;
  values: Array<PlanningValueInput>;
};

export type PlanningComputedValue = {
  isTransfer: Scalars['Boolean'];
  isVerified: Scalars['Boolean'];
  key: Scalars['String'];
  month: Scalars['NonNegativeInt'];
  name: Scalars['String'];
  value: Scalars['Int'];
};

export type PlanningCreditCard = {
  id: Scalars['NonNegativeInt'];
  netWorthSubcategoryId: Scalars['NonNegativeInt'];
  payments: Array<PlanningCreditCardPayment>;
  predictedPayment?: Maybe<Scalars['Int']>;
};

export type PlanningCreditCardInput = {
  id?: Maybe<Scalars['NonNegativeInt']>;
  netWorthSubcategoryId: Scalars['NonNegativeInt'];
  payments: Array<PlanningCreditCardPaymentInput>;
};

export type PlanningCreditCardPayment = {
  id: Scalars['NonNegativeInt'];
  month: Scalars['NonNegativeInt'];
  value: Scalars['Int'];
};

export type PlanningCreditCardPaymentInput = {
  id?: Maybe<Scalars['NonNegativeInt']>;
  month: Scalars['NonNegativeInt'];
  value: Scalars['Int'];
};

export type PlanningIncome = {
  endDate: Scalars['Date'];
  id: Scalars['NonNegativeInt'];
  pensionContrib: Scalars['Float'];
  salary: Scalars['NonNegativeInt'];
  startDate: Scalars['Date'];
  studentLoan: Scalars['Boolean'];
  taxCode: Scalars['String'];
};

export type PlanningIncomeInput = {
  endDate: Scalars['Date'];
  id?: Maybe<Scalars['NonNegativeInt']>;
  pensionContrib: Scalars['Float'];
  salary: Scalars['NonNegativeInt'];
  startDate: Scalars['Date'];
  studentLoan: Scalars['Boolean'];
  taxCode: Scalars['String'];
};

export type PlanningParameters = {
  rates: Array<TaxRate>;
  thresholds: Array<TaxThreshold>;
};

export type PlanningParametersInput = {
  rates: Array<PlanningTaxRateInput>;
  thresholds: Array<PlanningTaxThresholdInput>;
};

export type PlanningSync = {
  accounts: Array<PlanningAccountInput>;
  parameters: PlanningParametersInput;
};

export type PlanningSyncResponse = {
  accounts?: Maybe<Array<PlanningAccount>>;
  error?: Maybe<Scalars['String']>;
  parameters?: Maybe<PlanningParameters>;
  taxReliefFromPreviousYear?: Maybe<Scalars['Int']>;
  year?: Maybe<Scalars['NonNegativeInt']>;
};

export type PlanningTaxRateInput = {
  name: Scalars['String'];
  value: Scalars['Float'];
};

export type PlanningTaxThresholdInput = {
  name: Scalars['String'];
  value: Scalars['NonNegativeInt'];
};

export type PlanningValue = {
  formula?: Maybe<Scalars['String']>;
  id: Scalars['NonNegativeInt'];
  month: Scalars['NonNegativeInt'];
  name: Scalars['String'];
  transferToAccountId?: Maybe<Scalars['NonNegativeInt']>;
  value?: Maybe<Scalars['Int']>;
};

export type PlanningValueInput = {
  formula?: Maybe<Scalars['String']>;
  id?: Maybe<Scalars['NonNegativeInt']>;
  month: Scalars['NonNegativeInt'];
  name: Scalars['String'];
  transferToAccountId?: Maybe<Scalars['NonNegativeInt']>;
  value?: Maybe<Scalars['Int']>;
};


export type Query = {
  analysis?: Maybe<AnalysisResponse>;
  analysisDeep?: Maybe<Array<CategoryCostTreeDeep>>;
  cashAllocationTarget?: Maybe<Scalars['NonNegativeInt']>;
  config?: Maybe<AppConfig>;
  exchangeRates?: Maybe<ExchangeRatesResponse>;
  fundHistory?: Maybe<FundHistory>;
  fundHistoryIndividual?: Maybe<FundHistoryIndividual>;
  netWorthCashTotal?: Maybe<NetWorthCashTotal>;
  netWorthLoans?: Maybe<NetWorthLoansResponse>;
  overview?: Maybe<Overview>;
  overviewOld?: Maybe<OverviewOld>;
  overviewPreview?: Maybe<OverviewPreview>;
  readFunds?: Maybe<ReadFundsResponse>;
  readIncome?: Maybe<IncomeReadResponse>;
  readList?: Maybe<ListReadResponse>;
  readNetWorthCategories?: Maybe<Array<NetWorthCategory>>;
  readNetWorthEntries?: Maybe<NetWorthEntryOverview>;
  readNetWorthSubcategories?: Maybe<Array<NetWorthSubcategory>>;
  receiptItem?: Maybe<Scalars['String']>;
  receiptItems?: Maybe<Array<ReceiptCategory>>;
  search?: Maybe<SearchResult>;
  stockPrices?: Maybe<StockPricesResponse>;
  stockValue?: Maybe<StockValueResponse>;
  whoami?: Maybe<UserInfo>;
};


export type QueryAnalysisArgs = {
  groupBy: AnalysisGroupBy;
  page?: Maybe<Scalars['Int']>;
  period: AnalysisPeriod;
};


export type QueryAnalysisDeepArgs = {
  category: AnalysisPage;
  groupBy: AnalysisGroupBy;
  page?: Maybe<Scalars['Int']>;
  period: AnalysisPeriod;
};


export type QueryExchangeRatesArgs = {
  base: Scalars['String'];
};


export type QueryFundHistoryArgs = {
  length?: Maybe<Scalars['NonNegativeInt']>;
  period?: Maybe<FundPeriod>;
};


export type QueryFundHistoryIndividualArgs = {
  id: Scalars['NonNegativeInt'];
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


export type QueryReadIncomeArgs = {
  limit?: Maybe<Scalars['Int']>;
  offset?: Maybe<Scalars['Int']>;
};


export type QueryReadListArgs = {
  limit?: Maybe<Scalars['Int']>;
  offset?: Maybe<Scalars['Int']>;
  page: PageListStandard;
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
  column: SearchItem;
  numResults?: Maybe<Scalars['Int']>;
  page: SearchPage;
  searchTerm: Scalars['String'];
};


export type QueryStockPricesArgs = {
  codes: Array<Scalars['String']>;
};

export type ReadFundsResponse = {
  items: Array<Fund>;
};

export type ReceiptCategory = {
  category: Scalars['String'];
  item: Scalars['String'];
  page: ReceiptPage;
};

export type ReceiptCreated = {
  error?: Maybe<Scalars['String']>;
  items?: Maybe<Array<ReceiptItem>>;
};

export type ReceiptInput = {
  category: Scalars['String'];
  cost: Scalars['Int'];
  item: Scalars['String'];
  page: ReceiptPage;
};

export type ReceiptItem = {
  category: Scalars['String'];
  cost: Scalars['Int'];
  date: Scalars['Date'];
  id: Scalars['Int'];
  item: Scalars['String'];
  page: ReceiptPage;
  shop: Scalars['String'];
};

export enum ReceiptPage {
  Food = 'food',
  General = 'general',
  Social = 'social'
}

export enum SearchItem {
  Category = 'category',
  Item = 'item',
  Shop = 'shop'
}

export enum SearchPage {
  Bills = 'bills',
  Food = 'food',
  General = 'general',
  Holiday = 'holiday',
  Income = 'income',
  Social = 'social'
}

export type SearchResult = {
  error?: Maybe<Scalars['String']>;
  list: Array<Scalars['String']>;
  nextCategory?: Maybe<Array<Scalars['String']>>;
  nextField?: Maybe<Scalars['String']>;
  searchTerm?: Maybe<Scalars['String']>;
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

export type StockValueResponse = {
  error?: Maybe<Scalars['String']>;
  latestValue?: Maybe<Scalars['Int']>;
  previousValue?: Maybe<Scalars['Int']>;
  refreshTime?: Maybe<Scalars['DateTime']>;
};

export type Subscription = {
  cashAllocationTargetUpdated: Scalars['NonNegativeInt'];
  configUpdated: AppConfig;
  fundAllocationTargetsUpdated: UpdatedFundAllocationTargets;
  fundPricesUpdated?: Maybe<FundHistory>;
  fundsChanged: FundSubscription;
  incomeChanged: IncomeSubscription;
  listChanged: ListSubscription;
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
  length?: Maybe<Scalars['NonNegativeInt']>;
  period?: Maybe<FundPeriod>;
};


export type SubscriptionListChangedArgs = {
  pages: Array<PageListStandard>;
};

export type TargetDelta = {
  allocationTarget: Scalars['NonNegativeInt'];
  id: Scalars['Int'];
};

export type TargetDeltaResponse = {
  allocationTarget: Scalars['NonNegativeInt'];
  id: Scalars['Int'];
};

export type TaxRate = {
  name: Scalars['String'];
  value: Scalars['Float'];
};

export type TaxThreshold = {
  name: Scalars['String'];
  value: Scalars['NonNegativeInt'];
};

export type Transaction = {
  date: Scalars['Date'];
  drip: Scalars['Boolean'];
  fees: Scalars['Int'];
  pension: Scalars['Boolean'];
  price: Scalars['NonNegativeFloat'];
  taxes: Scalars['Int'];
  units: Scalars['Float'];
};

export type TransactionInput = {
  date: Scalars['Date'];
  drip: Scalars['Boolean'];
  fees: Scalars['Int'];
  pension: Scalars['Boolean'];
  price: Scalars['NonNegativeFloat'];
  taxes: Scalars['Int'];
  units: Scalars['Float'];
};

export type UpdatedFundAllocationTargets = {
  deltas?: Maybe<Array<TargetDeltaResponse>>;
  error?: Maybe<Scalars['String']>;
};

export type User = {
  uid: Scalars['Int'];
};

export type UserInfo = {
  name: Scalars['String'];
  uid: Scalars['Int'];
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
  AppConfig: ResolverTypeWrapper<AppConfig>;
  AppConfigInput: AppConfigInput;
  AppConfigSet: ResolverTypeWrapper<AppConfigSet>;
  Boolean: ResolverTypeWrapper<Scalars['Boolean']>;
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
  Float: ResolverTypeWrapper<Scalars['Float']>;
  Fund: ResolverTypeWrapper<Fund>;
  FundCreatedSubscription: ResolverTypeWrapper<FundCreatedSubscription>;
  FundHistory: ResolverTypeWrapper<FundHistory>;
  FundHistoryIndividual: ResolverTypeWrapper<FundHistoryIndividual>;
  FundInput: FundInput;
  FundMode: FundMode;
  FundPeriod: FundPeriod;
  FundPriceGroup: ResolverTypeWrapper<FundPriceGroup>;
  FundPrices: ResolverTypeWrapper<FundPrices>;
  FundSubscription: ResolverTypeWrapper<FundSubscription>;
  FundValueIndividual: ResolverTypeWrapper<FundValueIndividual>;
  FXValue: ResolverTypeWrapper<FxValue>;
  FXValueInput: FxValueInput;
  Income: ResolverTypeWrapper<Income>;
  IncomeCreatedSubscription: ResolverTypeWrapper<IncomeCreatedSubscription>;
  IncomeDeduction: ResolverTypeWrapper<IncomeDeduction>;
  IncomeDeductionInput: IncomeDeductionInput;
  IncomeInput: IncomeInput;
  IncomeReadResponse: ResolverTypeWrapper<IncomeReadResponse>;
  IncomeSubscription: ResolverTypeWrapper<IncomeSubscription>;
  IncomeTotals: ResolverTypeWrapper<IncomeTotals>;
  InitialCumulativeValues: ResolverTypeWrapper<InitialCumulativeValues>;
  Int: ResolverTypeWrapper<Scalars['Int']>;
  ListItem: ResolverTypeWrapper<ListItem>;
  ListItemInput: ListItemInput;
  ListItemStandard: ResolverTypeWrapper<ListItemStandard>;
  ListItemStandardCreatedSubscription: ResolverTypeWrapper<ListItemStandardCreatedSubscription>;
  ListItemStandardInput: ListItemStandardInput;
  ListReadResponse: ResolverTypeWrapper<ListReadResponse>;
  ListSubscription: ResolverTypeWrapper<ListSubscription>;
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
  NetWorthLoansResponse: ResolverTypeWrapper<NetWorthLoansResponse>;
  NetWorthLoanValue: ResolverTypeWrapper<NetWorthLoanValue>;
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
  PlanningAccount: ResolverTypeWrapper<PlanningAccount>;
  PlanningAccountInput: PlanningAccountInput;
  PlanningComputedValue: ResolverTypeWrapper<PlanningComputedValue>;
  PlanningCreditCard: ResolverTypeWrapper<PlanningCreditCard>;
  PlanningCreditCardInput: PlanningCreditCardInput;
  PlanningCreditCardPayment: ResolverTypeWrapper<PlanningCreditCardPayment>;
  PlanningCreditCardPaymentInput: PlanningCreditCardPaymentInput;
  PlanningIncome: ResolverTypeWrapper<PlanningIncome>;
  PlanningIncomeInput: PlanningIncomeInput;
  PlanningParameters: ResolverTypeWrapper<PlanningParameters>;
  PlanningParametersInput: PlanningParametersInput;
  PlanningSync: PlanningSync;
  PlanningSyncResponse: ResolverTypeWrapper<PlanningSyncResponse>;
  PlanningTaxRateInput: PlanningTaxRateInput;
  PlanningTaxThresholdInput: PlanningTaxThresholdInput;
  PlanningValue: ResolverTypeWrapper<PlanningValue>;
  PlanningValueInput: PlanningValueInput;
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
  SimpleValue: ResolverTypeWrapper<SimpleValue>;
  StockPrice: ResolverTypeWrapper<StockPrice>;
  StockPricesResponse: ResolverTypeWrapper<StockPricesResponse>;
  StockSplit: ResolverTypeWrapper<StockSplit>;
  StockSplitInput: StockSplitInput;
  StockValueResponse: ResolverTypeWrapper<StockValueResponse>;
  String: ResolverTypeWrapper<Scalars['String']>;
  Subscription: ResolverTypeWrapper<{}>;
  TargetDelta: TargetDelta;
  TargetDeltaResponse: ResolverTypeWrapper<TargetDeltaResponse>;
  TaxRate: ResolverTypeWrapper<TaxRate>;
  TaxThreshold: ResolverTypeWrapper<TaxThreshold>;
  Transaction: ResolverTypeWrapper<Transaction>;
  TransactionInput: TransactionInput;
  UpdatedFundAllocationTargets: ResolverTypeWrapper<UpdatedFundAllocationTargets>;
  User: ResolverTypeWrapper<User>;
  UserInfo: ResolverTypeWrapper<UserInfo>;
};

/** Mapping between all available schema types and the resolvers parents */
export type ResolversParentTypes = {
  AnalysisResponse: AnalysisResponse;
  AppConfig: AppConfig;
  AppConfigInput: AppConfigInput;
  AppConfigSet: AppConfigSet;
  Boolean: Scalars['Boolean'];
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
  Float: Scalars['Float'];
  Fund: Fund;
  FundCreatedSubscription: FundCreatedSubscription;
  FundHistory: FundHistory;
  FundHistoryIndividual: FundHistoryIndividual;
  FundInput: FundInput;
  FundPriceGroup: FundPriceGroup;
  FundPrices: FundPrices;
  FundSubscription: FundSubscription;
  FundValueIndividual: FundValueIndividual;
  FXValue: FxValue;
  FXValueInput: FxValueInput;
  Income: Income;
  IncomeCreatedSubscription: IncomeCreatedSubscription;
  IncomeDeduction: IncomeDeduction;
  IncomeDeductionInput: IncomeDeductionInput;
  IncomeInput: IncomeInput;
  IncomeReadResponse: IncomeReadResponse;
  IncomeSubscription: IncomeSubscription;
  IncomeTotals: IncomeTotals;
  InitialCumulativeValues: InitialCumulativeValues;
  Int: Scalars['Int'];
  ListItem: ListItem;
  ListItemInput: ListItemInput;
  ListItemStandard: ListItemStandard;
  ListItemStandardCreatedSubscription: ListItemStandardCreatedSubscription;
  ListItemStandardInput: ListItemStandardInput;
  ListReadResponse: ListReadResponse;
  ListSubscription: ListSubscription;
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
  NetWorthLoansResponse: NetWorthLoansResponse;
  NetWorthLoanValue: NetWorthLoanValue;
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
  PlanningAccount: PlanningAccount;
  PlanningAccountInput: PlanningAccountInput;
  PlanningComputedValue: PlanningComputedValue;
  PlanningCreditCard: PlanningCreditCard;
  PlanningCreditCardInput: PlanningCreditCardInput;
  PlanningCreditCardPayment: PlanningCreditCardPayment;
  PlanningCreditCardPaymentInput: PlanningCreditCardPaymentInput;
  PlanningIncome: PlanningIncome;
  PlanningIncomeInput: PlanningIncomeInput;
  PlanningParameters: PlanningParameters;
  PlanningParametersInput: PlanningParametersInput;
  PlanningSync: PlanningSync;
  PlanningSyncResponse: PlanningSyncResponse;
  PlanningTaxRateInput: PlanningTaxRateInput;
  PlanningTaxThresholdInput: PlanningTaxThresholdInput;
  PlanningValue: PlanningValue;
  PlanningValueInput: PlanningValueInput;
  PositiveInt: Scalars['PositiveInt'];
  Query: {};
  ReadFundsResponse: ReadFundsResponse;
  ReceiptCategory: ReceiptCategory;
  ReceiptCreated: ReceiptCreated;
  ReceiptInput: ReceiptInput;
  ReceiptItem: ReceiptItem;
  SearchResult: SearchResult;
  SimpleValue: SimpleValue;
  StockPrice: StockPrice;
  StockPricesResponse: StockPricesResponse;
  StockSplit: StockSplit;
  StockSplitInput: StockSplitInput;
  StockValueResponse: StockValueResponse;
  String: Scalars['String'];
  Subscription: {};
  TargetDelta: TargetDelta;
  TargetDeltaResponse: TargetDeltaResponse;
  TaxRate: TaxRate;
  TaxThreshold: TaxThreshold;
  Transaction: Transaction;
  TransactionInput: TransactionInput;
  UpdatedFundAllocationTargets: UpdatedFundAllocationTargets;
  User: User;
  UserInfo: UserInfo;
};

export type AnalysisResponseResolvers<ContextType = Context, ParentType extends ResolversParentTypes['AnalysisResponse'] = ResolversParentTypes['AnalysisResponse']> = {
  cost?: Resolver<Array<ResolversTypes['CategoryCostTree']>, ParentType, ContextType>;
  description?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  endDate?: Resolver<ResolversTypes['Date'], ParentType, ContextType>;
  startDate?: Resolver<ResolversTypes['Date'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type AppConfigResolvers<ContextType = Context, ParentType extends ResolversParentTypes['AppConfig'] = ResolversParentTypes['AppConfig']> = {
  birthDate?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  fundLength?: Resolver<Maybe<ResolversTypes['NonNegativeInt']>, ParentType, ContextType>;
  fundMode?: Resolver<Maybe<ResolversTypes['FundMode']>, ParentType, ContextType>;
  fundPeriod?: Resolver<Maybe<ResolversTypes['FundPeriod']>, ParentType, ContextType>;
  futureMonths?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  realTimePrices?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type AppConfigSetResolvers<ContextType = Context, ParentType extends ResolversParentTypes['AppConfigSet'] = ResolversParentTypes['AppConfigSet']> = {
  config?: Resolver<Maybe<ResolversTypes['AppConfig']>, ParentType, ContextType>;
  error?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
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

export type FundResolvers<ContextType = Context, ParentType extends ResolversParentTypes['Fund'] = ResolversParentTypes['Fund']> = {
  allocationTarget?: Resolver<Maybe<ResolversTypes['NonNegativeInt']>, ParentType, ContextType>;
  id?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  item?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  stockSplits?: Resolver<Array<ResolversTypes['StockSplit']>, ParentType, ContextType>;
  transactions?: Resolver<Array<ResolversTypes['Transaction']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type FundCreatedSubscriptionResolvers<ContextType = Context, ParentType extends ResolversParentTypes['FundCreatedSubscription'] = ResolversParentTypes['FundCreatedSubscription']> = {
  fakeId?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  item?: Resolver<ResolversTypes['Fund'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type FundHistoryResolvers<ContextType = Context, ParentType extends ResolversParentTypes['FundHistory'] = ResolversParentTypes['FundHistory']> = {
  annualisedFundReturns?: Resolver<ResolversTypes['Float'], ParentType, ContextType>;
  cacheTimes?: Resolver<Array<ResolversTypes['Int']>, ParentType, ContextType>;
  overviewCost?: Resolver<Array<ResolversTypes['Int']>, ParentType, ContextType>;
  prices?: Resolver<Array<ResolversTypes['FundPrices']>, ParentType, ContextType>;
  startTime?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
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

export type FundSubscriptionResolvers<ContextType = Context, ParentType extends ResolversParentTypes['FundSubscription'] = ResolversParentTypes['FundSubscription']> = {
  created?: Resolver<Maybe<ResolversTypes['FundCreatedSubscription']>, ParentType, ContextType>;
  deleted?: Resolver<Maybe<ResolversTypes['NonNegativeInt']>, ParentType, ContextType>;
  overviewCost?: Resolver<Array<ResolversTypes['Int']>, ParentType, ContextType>;
  updated?: Resolver<Maybe<ResolversTypes['Fund']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type FundValueIndividualResolvers<ContextType = Context, ParentType extends ResolversParentTypes['FundValueIndividual'] = ResolversParentTypes['FundValueIndividual']> = {
  date?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  price?: Resolver<ResolversTypes['NonNegativeFloat'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type FxValueResolvers<ContextType = Context, ParentType extends ResolversParentTypes['FXValue'] = ResolversParentTypes['FXValue']> = {
  currency?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  value?: Resolver<ResolversTypes['Float'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type IncomeResolvers<ContextType = Context, ParentType extends ResolversParentTypes['Income'] = ResolversParentTypes['Income']> = {
  category?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  cost?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  date?: Resolver<ResolversTypes['Date'], ParentType, ContextType>;
  deductions?: Resolver<Array<ResolversTypes['IncomeDeduction']>, ParentType, ContextType>;
  id?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  item?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  shop?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type IncomeCreatedSubscriptionResolvers<ContextType = Context, ParentType extends ResolversParentTypes['IncomeCreatedSubscription'] = ResolversParentTypes['IncomeCreatedSubscription']> = {
  fakeId?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  item?: Resolver<ResolversTypes['Income'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type IncomeDeductionResolvers<ContextType = Context, ParentType extends ResolversParentTypes['IncomeDeduction'] = ResolversParentTypes['IncomeDeduction']> = {
  name?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  value?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type IncomeReadResponseResolvers<ContextType = Context, ParentType extends ResolversParentTypes['IncomeReadResponse'] = ResolversParentTypes['IncomeReadResponse']> = {
  error?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  items?: Resolver<Array<ResolversTypes['Income']>, ParentType, ContextType>;
  olderExists?: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
  total?: Resolver<Maybe<ResolversTypes['IncomeTotals']>, ParentType, ContextType>;
  weekly?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type IncomeSubscriptionResolvers<ContextType = Context, ParentType extends ResolversParentTypes['IncomeSubscription'] = ResolversParentTypes['IncomeSubscription']> = {
  created?: Resolver<Maybe<ResolversTypes['IncomeCreatedSubscription']>, ParentType, ContextType>;
  deleted?: Resolver<Maybe<ResolversTypes['NonNegativeInt']>, ParentType, ContextType>;
  overviewCost?: Resolver<Array<ResolversTypes['Int']>, ParentType, ContextType>;
  total?: Resolver<Maybe<ResolversTypes['IncomeTotals']>, ParentType, ContextType>;
  updated?: Resolver<Maybe<ResolversTypes['Income']>, ParentType, ContextType>;
  weekly?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type IncomeTotalsResolvers<ContextType = Context, ParentType extends ResolversParentTypes['IncomeTotals'] = ResolversParentTypes['IncomeTotals']> = {
  deductions?: Resolver<Array<ResolversTypes['IncomeDeduction']>, ParentType, ContextType>;
  gross?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type InitialCumulativeValuesResolvers<ContextType = Context, ParentType extends ResolversParentTypes['InitialCumulativeValues'] = ResolversParentTypes['InitialCumulativeValues']> = {
  income?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  spending?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type ListItemResolvers<ContextType = Context, ParentType extends ResolversParentTypes['ListItem'] = ResolversParentTypes['ListItem']> = {
  id?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  item?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type ListItemStandardResolvers<ContextType = Context, ParentType extends ResolversParentTypes['ListItemStandard'] = ResolversParentTypes['ListItemStandard']> = {
  category?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  cost?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  date?: Resolver<ResolversTypes['Date'], ParentType, ContextType>;
  id?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  item?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  shop?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type ListItemStandardCreatedSubscriptionResolvers<ContextType = Context, ParentType extends ResolversParentTypes['ListItemStandardCreatedSubscription'] = ResolversParentTypes['ListItemStandardCreatedSubscription']> = {
  fakeId?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  item?: Resolver<ResolversTypes['ListItemStandard'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type ListReadResponseResolvers<ContextType = Context, ParentType extends ResolversParentTypes['ListReadResponse'] = ResolversParentTypes['ListReadResponse']> = {
  error?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  items?: Resolver<Array<ResolversTypes['ListItemStandard']>, ParentType, ContextType>;
  olderExists?: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
  total?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  weekly?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type ListSubscriptionResolvers<ContextType = Context, ParentType extends ResolversParentTypes['ListSubscription'] = ResolversParentTypes['ListSubscription']> = {
  created?: Resolver<Maybe<ResolversTypes['ListItemStandardCreatedSubscription']>, ParentType, ContextType>;
  deleted?: Resolver<Maybe<ResolversTypes['NonNegativeInt']>, ParentType, ContextType>;
  overviewCost?: Resolver<Array<ResolversTypes['Int']>, ParentType, ContextType>;
  page?: Resolver<ResolversTypes['PageListStandard'], ParentType, ContextType>;
  total?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  updated?: Resolver<Maybe<ResolversTypes['ListItemStandard']>, ParentType, ContextType>;
  weekly?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type ListTotalsResponseResolvers<ContextType = Context, ParentType extends ResolversParentTypes['ListTotalsResponse'] = ResolversParentTypes['ListTotalsResponse']> = {
  error?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  total?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  weekly?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type LoanValueResolvers<ContextType = Context, ParentType extends ResolversParentTypes['LoanValue'] = ResolversParentTypes['LoanValue']> = {
  paid?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  paymentsRemaining?: Resolver<ResolversTypes['NonNegativeInt'], ParentType, ContextType>;
  principal?: Resolver<ResolversTypes['NonNegativeInt'], ParentType, ContextType>;
  rate?: Resolver<ResolversTypes['Float'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type LoginResponseResolvers<ContextType = Context, ParentType extends ResolversParentTypes['LoginResponse'] = ResolversParentTypes['LoginResponse']> = {
  apiKey?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  error?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  expires?: Resolver<Maybe<ResolversTypes['DateTime']>, ParentType, ContextType>;
  name?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  uid?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type LogoutResponseResolvers<ContextType = Context, ParentType extends ResolversParentTypes['LogoutResponse'] = ResolversParentTypes['LogoutResponse']> = {
  error?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  ok?: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type MonthlyResolvers<ContextType = Context, ParentType extends ResolversParentTypes['Monthly'] = ResolversParentTypes['Monthly']> = {
  bills?: Resolver<Array<ResolversTypes['Int']>, ParentType, ContextType>;
  food?: Resolver<Array<ResolversTypes['Int']>, ParentType, ContextType>;
  general?: Resolver<Array<ResolversTypes['Int']>, ParentType, ContextType>;
  holiday?: Resolver<Array<ResolversTypes['Int']>, ParentType, ContextType>;
  income?: Resolver<Array<ResolversTypes['Int']>, ParentType, ContextType>;
  investmentPurchases?: Resolver<Array<ResolversTypes['Int']>, ParentType, ContextType>;
  social?: Resolver<Array<ResolversTypes['Int']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type MutationResolvers<ContextType = Context, ParentType extends ResolversParentTypes['Mutation'] = ResolversParentTypes['Mutation']> = {
  createFund?: Resolver<Maybe<ResolversTypes['CrudResponseCreate']>, ParentType, ContextType, RequireFields<MutationCreateFundArgs, 'fakeId' | 'input'>>;
  createIncome?: Resolver<Maybe<ResolversTypes['CrudResponseCreate']>, ParentType, ContextType, RequireFields<MutationCreateIncomeArgs, 'fakeId' | 'input'>>;
  createListItem?: Resolver<Maybe<ResolversTypes['CrudResponseCreate']>, ParentType, ContextType, RequireFields<MutationCreateListItemArgs, 'fakeId' | 'input' | 'page'>>;
  createNetWorthCategory?: Resolver<Maybe<ResolversTypes['CrudResponseCreate']>, ParentType, ContextType, RequireFields<MutationCreateNetWorthCategoryArgs, 'input'>>;
  createNetWorthEntry?: Resolver<Maybe<ResolversTypes['CrudResponseCreate']>, ParentType, ContextType, RequireFields<MutationCreateNetWorthEntryArgs, 'input'>>;
  createNetWorthSubcategory?: Resolver<Maybe<ResolversTypes['CrudResponseCreate']>, ParentType, ContextType, RequireFields<MutationCreateNetWorthSubcategoryArgs, 'input'>>;
  createReceipt?: Resolver<Maybe<ResolversTypes['ReceiptCreated']>, ParentType, ContextType, RequireFields<MutationCreateReceiptArgs, 'date' | 'items' | 'shop'>>;
  deleteFund?: Resolver<Maybe<ResolversTypes['CrudResponseDelete']>, ParentType, ContextType, RequireFields<MutationDeleteFundArgs, 'id'>>;
  deleteIncome?: Resolver<Maybe<ResolversTypes['CrudResponseDelete']>, ParentType, ContextType, RequireFields<MutationDeleteIncomeArgs, 'id'>>;
  deleteListItem?: Resolver<Maybe<ResolversTypes['CrudResponseDelete']>, ParentType, ContextType, RequireFields<MutationDeleteListItemArgs, 'id' | 'page'>>;
  deleteNetWorthCategory?: Resolver<Maybe<ResolversTypes['CrudResponseDelete']>, ParentType, ContextType, RequireFields<MutationDeleteNetWorthCategoryArgs, 'id'>>;
  deleteNetWorthEntry?: Resolver<Maybe<ResolversTypes['CrudResponseDelete']>, ParentType, ContextType, RequireFields<MutationDeleteNetWorthEntryArgs, 'id'>>;
  deleteNetWorthSubcategory?: Resolver<Maybe<ResolversTypes['CrudResponseDelete']>, ParentType, ContextType, RequireFields<MutationDeleteNetWorthSubcategoryArgs, 'id'>>;
  login?: Resolver<ResolversTypes['LoginResponse'], ParentType, ContextType, RequireFields<MutationLoginArgs, 'pin'>>;
  logout?: Resolver<ResolversTypes['LogoutResponse'], ParentType, ContextType>;
  setConfig?: Resolver<Maybe<ResolversTypes['AppConfigSet']>, ParentType, ContextType, RequireFields<MutationSetConfigArgs, 'config'>>;
  syncPlanning?: Resolver<Maybe<ResolversTypes['PlanningSyncResponse']>, ParentType, ContextType, RequireFields<MutationSyncPlanningArgs, 'year'>>;
  updateCashAllocationTarget?: Resolver<Maybe<ResolversTypes['CrudResponseUpdate']>, ParentType, ContextType, RequireFields<MutationUpdateCashAllocationTargetArgs, 'target'>>;
  updateFund?: Resolver<Maybe<ResolversTypes['CrudResponseUpdate']>, ParentType, ContextType, RequireFields<MutationUpdateFundArgs, 'id' | 'input'>>;
  updateFundAllocationTargets?: Resolver<Maybe<ResolversTypes['UpdatedFundAllocationTargets']>, ParentType, ContextType, RequireFields<MutationUpdateFundAllocationTargetsArgs, 'deltas'>>;
  updateIncome?: Resolver<Maybe<ResolversTypes['CrudResponseUpdate']>, ParentType, ContextType, RequireFields<MutationUpdateIncomeArgs, 'id' | 'input'>>;
  updateListItem?: Resolver<Maybe<ResolversTypes['CrudResponseUpdate']>, ParentType, ContextType, RequireFields<MutationUpdateListItemArgs, 'id' | 'input' | 'page'>>;
  updateNetWorthCategory?: Resolver<Maybe<ResolversTypes['CrudResponseUpdate']>, ParentType, ContextType, RequireFields<MutationUpdateNetWorthCategoryArgs, 'id' | 'input'>>;
  updateNetWorthEntry?: Resolver<Maybe<ResolversTypes['CrudResponseUpdate']>, ParentType, ContextType, RequireFields<MutationUpdateNetWorthEntryArgs, 'id' | 'input'>>;
  updateNetWorthSubcategory?: Resolver<Maybe<ResolversTypes['CrudResponseUpdate']>, ParentType, ContextType, RequireFields<MutationUpdateNetWorthSubcategoryArgs, 'id' | 'input'>>;
};

export type NetWorthCashTotalResolvers<ContextType = Context, ParentType extends ResolversParentTypes['NetWorthCashTotal'] = ResolversParentTypes['NetWorthCashTotal']> = {
  cashInBank?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  date?: Resolver<Maybe<ResolversTypes['Date']>, ParentType, ContextType>;
  incomeSince?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  spendingSince?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  stocksIncludingCash?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  stockValue?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type NetWorthCategoryResolvers<ContextType = Context, ParentType extends ResolversParentTypes['NetWorthCategory'] = ResolversParentTypes['NetWorthCategory']> = {
  category?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  color?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  id?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  isOption?: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
  type?: Resolver<ResolversTypes['NetWorthCategoryType'], ParentType, ContextType>;
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
  creditLimit?: Resolver<Array<ResolversTypes['CreditLimit']>, ParentType, ContextType>;
  currencies?: Resolver<Array<ResolversTypes['Currency']>, ParentType, ContextType>;
  date?: Resolver<ResolversTypes['Date'], ParentType, ContextType>;
  id?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  values?: Resolver<Array<ResolversTypes['NetWorthValueObject']>, ParentType, ContextType>;
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

export type NetWorthLoansResponseResolvers<ContextType = Context, ParentType extends ResolversParentTypes['NetWorthLoansResponse'] = ResolversParentTypes['NetWorthLoansResponse']> = {
  error?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  loans?: Resolver<Maybe<Array<ResolversTypes['NetWorthLoan']>>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type NetWorthLoanValueResolvers<ContextType = Context, ParentType extends ResolversParentTypes['NetWorthLoanValue'] = ResolversParentTypes['NetWorthLoanValue']> = {
  date?: Resolver<ResolversTypes['Date'], ParentType, ContextType>;
  value?: Resolver<ResolversTypes['LoanValue'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type NetWorthSubcategoryResolvers<ContextType = Context, ParentType extends ResolversParentTypes['NetWorthSubcategory'] = ResolversParentTypes['NetWorthSubcategory']> = {
  appreciationRate?: Resolver<Maybe<ResolversTypes['Float']>, ParentType, ContextType>;
  categoryId?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  hasCreditLimit?: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
  id?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  isSAYE?: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
  opacity?: Resolver<Maybe<ResolversTypes['Float']>, ParentType, ContextType>;
  subcategory?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
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
  fx?: Resolver<Maybe<Array<ResolversTypes['FXValue']>>, ParentType, ContextType>;
  loan?: Resolver<Maybe<ResolversTypes['LoanValue']>, ParentType, ContextType>;
  option?: Resolver<Maybe<ResolversTypes['OptionValue']>, ParentType, ContextType>;
  simple?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  skip?: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
  subcategory?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  value?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export interface NonNegativeFloatScalarConfig extends GraphQLScalarTypeConfig<ResolversTypes['NonNegativeFloat'], any> {
  name: 'NonNegativeFloat';
}

export interface NonNegativeIntScalarConfig extends GraphQLScalarTypeConfig<ResolversTypes['NonNegativeInt'], any> {
  name: 'NonNegativeInt';
}

export type OptionValueResolvers<ContextType = Context, ParentType extends ResolversParentTypes['OptionValue'] = ResolversParentTypes['OptionValue']> = {
  marketPrice?: Resolver<ResolversTypes['NonNegativeFloat'], ParentType, ContextType>;
  strikePrice?: Resolver<ResolversTypes['NonNegativeFloat'], ParentType, ContextType>;
  units?: Resolver<ResolversTypes['NonNegativeInt'], ParentType, ContextType>;
  vested?: Resolver<ResolversTypes['NonNegativeInt'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type OverviewResolvers<ContextType = Context, ParentType extends ResolversParentTypes['Overview'] = ResolversParentTypes['Overview']> = {
  endDate?: Resolver<ResolversTypes['Date'], ParentType, ContextType>;
  futureIncome?: Resolver<Array<ResolversTypes['Int']>, ParentType, ContextType>;
  initialCumulativeValues?: Resolver<ResolversTypes['InitialCumulativeValues'], ParentType, ContextType>;
  monthly?: Resolver<ResolversTypes['Monthly'], ParentType, ContextType>;
  startDate?: Resolver<ResolversTypes['Date'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type OverviewOldResolvers<ContextType = Context, ParentType extends ResolversParentTypes['OverviewOld'] = ResolversParentTypes['OverviewOld']> = {
  assets?: Resolver<Array<ResolversTypes['Int']>, ParentType, ContextType>;
  cashLiquid?: Resolver<Array<ResolversTypes['Int']>, ParentType, ContextType>;
  cashOther?: Resolver<Array<ResolversTypes['Int']>, ParentType, ContextType>;
  illiquidEquity?: Resolver<Array<ResolversTypes['Int']>, ParentType, ContextType>;
  income?: Resolver<Array<ResolversTypes['Int']>, ParentType, ContextType>;
  investmentPurchases?: Resolver<Array<ResolversTypes['Int']>, ParentType, ContextType>;
  investments?: Resolver<Array<ResolversTypes['Int']>, ParentType, ContextType>;
  liabilities?: Resolver<Array<ResolversTypes['Int']>, ParentType, ContextType>;
  netWorth?: Resolver<Array<ResolversTypes['Int']>, ParentType, ContextType>;
  options?: Resolver<Array<ResolversTypes['Int']>, ParentType, ContextType>;
  pension?: Resolver<Array<ResolversTypes['Int']>, ParentType, ContextType>;
  spending?: Resolver<Array<ResolversTypes['Int']>, ParentType, ContextType>;
  startDate?: Resolver<ResolversTypes['Date'], ParentType, ContextType>;
  stocks?: Resolver<Array<ResolversTypes['Int']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type OverviewPreviewResolvers<ContextType = Context, ParentType extends ResolversParentTypes['OverviewPreview'] = ResolversParentTypes['OverviewPreview']> = {
  startDate?: Resolver<ResolversTypes['Date'], ParentType, ContextType>;
  values?: Resolver<Array<ResolversTypes['Int']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type PlanningAccountResolvers<ContextType = Context, ParentType extends ResolversParentTypes['PlanningAccount'] = ResolversParentTypes['PlanningAccount']> = {
  account?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  computedStartValue?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  computedValues?: Resolver<Array<ResolversTypes['PlanningComputedValue']>, ParentType, ContextType>;
  creditCards?: Resolver<Array<ResolversTypes['PlanningCreditCard']>, ParentType, ContextType>;
  id?: Resolver<ResolversTypes['NonNegativeInt'], ParentType, ContextType>;
  includeBills?: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
  income?: Resolver<Array<ResolversTypes['PlanningIncome']>, ParentType, ContextType>;
  lowerLimit?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  netWorthSubcategoryId?: Resolver<ResolversTypes['NonNegativeInt'], ParentType, ContextType>;
  upperLimit?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  values?: Resolver<Array<ResolversTypes['PlanningValue']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type PlanningComputedValueResolvers<ContextType = Context, ParentType extends ResolversParentTypes['PlanningComputedValue'] = ResolversParentTypes['PlanningComputedValue']> = {
  isTransfer?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  isVerified?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  key?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  month?: Resolver<ResolversTypes['NonNegativeInt'], ParentType, ContextType>;
  name?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  value?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type PlanningCreditCardResolvers<ContextType = Context, ParentType extends ResolversParentTypes['PlanningCreditCard'] = ResolversParentTypes['PlanningCreditCard']> = {
  id?: Resolver<ResolversTypes['NonNegativeInt'], ParentType, ContextType>;
  netWorthSubcategoryId?: Resolver<ResolversTypes['NonNegativeInt'], ParentType, ContextType>;
  payments?: Resolver<Array<ResolversTypes['PlanningCreditCardPayment']>, ParentType, ContextType>;
  predictedPayment?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type PlanningCreditCardPaymentResolvers<ContextType = Context, ParentType extends ResolversParentTypes['PlanningCreditCardPayment'] = ResolversParentTypes['PlanningCreditCardPayment']> = {
  id?: Resolver<ResolversTypes['NonNegativeInt'], ParentType, ContextType>;
  month?: Resolver<ResolversTypes['NonNegativeInt'], ParentType, ContextType>;
  value?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type PlanningIncomeResolvers<ContextType = Context, ParentType extends ResolversParentTypes['PlanningIncome'] = ResolversParentTypes['PlanningIncome']> = {
  endDate?: Resolver<ResolversTypes['Date'], ParentType, ContextType>;
  id?: Resolver<ResolversTypes['NonNegativeInt'], ParentType, ContextType>;
  pensionContrib?: Resolver<ResolversTypes['Float'], ParentType, ContextType>;
  salary?: Resolver<ResolversTypes['NonNegativeInt'], ParentType, ContextType>;
  startDate?: Resolver<ResolversTypes['Date'], ParentType, ContextType>;
  studentLoan?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  taxCode?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type PlanningParametersResolvers<ContextType = Context, ParentType extends ResolversParentTypes['PlanningParameters'] = ResolversParentTypes['PlanningParameters']> = {
  rates?: Resolver<Array<ResolversTypes['TaxRate']>, ParentType, ContextType>;
  thresholds?: Resolver<Array<ResolversTypes['TaxThreshold']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type PlanningSyncResponseResolvers<ContextType = Context, ParentType extends ResolversParentTypes['PlanningSyncResponse'] = ResolversParentTypes['PlanningSyncResponse']> = {
  accounts?: Resolver<Maybe<Array<ResolversTypes['PlanningAccount']>>, ParentType, ContextType>;
  error?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  parameters?: Resolver<Maybe<ResolversTypes['PlanningParameters']>, ParentType, ContextType>;
  taxReliefFromPreviousYear?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  year?: Resolver<Maybe<ResolversTypes['NonNegativeInt']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type PlanningValueResolvers<ContextType = Context, ParentType extends ResolversParentTypes['PlanningValue'] = ResolversParentTypes['PlanningValue']> = {
  formula?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  id?: Resolver<ResolversTypes['NonNegativeInt'], ParentType, ContextType>;
  month?: Resolver<ResolversTypes['NonNegativeInt'], ParentType, ContextType>;
  name?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  transferToAccountId?: Resolver<Maybe<ResolversTypes['NonNegativeInt']>, ParentType, ContextType>;
  value?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export interface PositiveIntScalarConfig extends GraphQLScalarTypeConfig<ResolversTypes['PositiveInt'], any> {
  name: 'PositiveInt';
}

export type QueryResolvers<ContextType = Context, ParentType extends ResolversParentTypes['Query'] = ResolversParentTypes['Query']> = {
  analysis?: Resolver<Maybe<ResolversTypes['AnalysisResponse']>, ParentType, ContextType, RequireFields<QueryAnalysisArgs, 'groupBy' | 'period'>>;
  analysisDeep?: Resolver<Maybe<Array<ResolversTypes['CategoryCostTreeDeep']>>, ParentType, ContextType, RequireFields<QueryAnalysisDeepArgs, 'category' | 'groupBy' | 'period'>>;
  cashAllocationTarget?: Resolver<Maybe<ResolversTypes['NonNegativeInt']>, ParentType, ContextType>;
  config?: Resolver<Maybe<ResolversTypes['AppConfig']>, ParentType, ContextType>;
  exchangeRates?: Resolver<Maybe<ResolversTypes['ExchangeRatesResponse']>, ParentType, ContextType, RequireFields<QueryExchangeRatesArgs, 'base'>>;
  fundHistory?: Resolver<Maybe<ResolversTypes['FundHistory']>, ParentType, ContextType, RequireFields<QueryFundHistoryArgs, never>>;
  fundHistoryIndividual?: Resolver<Maybe<ResolversTypes['FundHistoryIndividual']>, ParentType, ContextType, RequireFields<QueryFundHistoryIndividualArgs, 'id'>>;
  netWorthCashTotal?: Resolver<Maybe<ResolversTypes['NetWorthCashTotal']>, ParentType, ContextType>;
  netWorthLoans?: Resolver<Maybe<ResolversTypes['NetWorthLoansResponse']>, ParentType, ContextType>;
  overview?: Resolver<Maybe<ResolversTypes['Overview']>, ParentType, ContextType, RequireFields<QueryOverviewArgs, never>>;
  overviewOld?: Resolver<Maybe<ResolversTypes['OverviewOld']>, ParentType, ContextType, RequireFields<QueryOverviewOldArgs, never>>;
  overviewPreview?: Resolver<Maybe<ResolversTypes['OverviewPreview']>, ParentType, ContextType, RequireFields<QueryOverviewPreviewArgs, 'category' | 'date'>>;
  readFunds?: Resolver<Maybe<ResolversTypes['ReadFundsResponse']>, ParentType, ContextType>;
  readIncome?: Resolver<Maybe<ResolversTypes['IncomeReadResponse']>, ParentType, ContextType, RequireFields<QueryReadIncomeArgs, never>>;
  readList?: Resolver<Maybe<ResolversTypes['ListReadResponse']>, ParentType, ContextType, RequireFields<QueryReadListArgs, 'page'>>;
  readNetWorthCategories?: Resolver<Maybe<Array<ResolversTypes['NetWorthCategory']>>, ParentType, ContextType, RequireFields<QueryReadNetWorthCategoriesArgs, never>>;
  readNetWorthEntries?: Resolver<Maybe<ResolversTypes['NetWorthEntryOverview']>, ParentType, ContextType>;
  readNetWorthSubcategories?: Resolver<Maybe<Array<ResolversTypes['NetWorthSubcategory']>>, ParentType, ContextType, RequireFields<QueryReadNetWorthSubcategoriesArgs, never>>;
  receiptItem?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType, RequireFields<QueryReceiptItemArgs, 'item'>>;
  receiptItems?: Resolver<Maybe<Array<ResolversTypes['ReceiptCategory']>>, ParentType, ContextType, RequireFields<QueryReceiptItemsArgs, 'items'>>;
  search?: Resolver<Maybe<ResolversTypes['SearchResult']>, ParentType, ContextType, RequireFields<QuerySearchArgs, 'column' | 'page' | 'searchTerm'>>;
  stockPrices?: Resolver<Maybe<ResolversTypes['StockPricesResponse']>, ParentType, ContextType, RequireFields<QueryStockPricesArgs, 'codes'>>;
  stockValue?: Resolver<Maybe<ResolversTypes['StockValueResponse']>, ParentType, ContextType>;
  whoami?: Resolver<Maybe<ResolversTypes['UserInfo']>, ParentType, ContextType>;
};

export type ReadFundsResponseResolvers<ContextType = Context, ParentType extends ResolversParentTypes['ReadFundsResponse'] = ResolversParentTypes['ReadFundsResponse']> = {
  items?: Resolver<Array<ResolversTypes['Fund']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type ReceiptCategoryResolvers<ContextType = Context, ParentType extends ResolversParentTypes['ReceiptCategory'] = ResolversParentTypes['ReceiptCategory']> = {
  category?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  item?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  page?: Resolver<ResolversTypes['ReceiptPage'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type ReceiptCreatedResolvers<ContextType = Context, ParentType extends ResolversParentTypes['ReceiptCreated'] = ResolversParentTypes['ReceiptCreated']> = {
  error?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  items?: Resolver<Maybe<Array<ResolversTypes['ReceiptItem']>>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type ReceiptItemResolvers<ContextType = Context, ParentType extends ResolversParentTypes['ReceiptItem'] = ResolversParentTypes['ReceiptItem']> = {
  category?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  cost?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  date?: Resolver<ResolversTypes['Date'], ParentType, ContextType>;
  id?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  item?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  page?: Resolver<ResolversTypes['ReceiptPage'], ParentType, ContextType>;
  shop?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type SearchResultResolvers<ContextType = Context, ParentType extends ResolversParentTypes['SearchResult'] = ResolversParentTypes['SearchResult']> = {
  error?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  list?: Resolver<Array<ResolversTypes['String']>, ParentType, ContextType>;
  nextCategory?: Resolver<Maybe<Array<ResolversTypes['String']>>, ParentType, ContextType>;
  nextField?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  searchTerm?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
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

export type StockValueResponseResolvers<ContextType = Context, ParentType extends ResolversParentTypes['StockValueResponse'] = ResolversParentTypes['StockValueResponse']> = {
  error?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  latestValue?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  previousValue?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  refreshTime?: Resolver<Maybe<ResolversTypes['DateTime']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type SubscriptionResolvers<ContextType = Context, ParentType extends ResolversParentTypes['Subscription'] = ResolversParentTypes['Subscription']> = {
  cashAllocationTargetUpdated?: SubscriptionResolver<ResolversTypes['NonNegativeInt'], "cashAllocationTargetUpdated", ParentType, ContextType>;
  configUpdated?: SubscriptionResolver<ResolversTypes['AppConfig'], "configUpdated", ParentType, ContextType>;
  fundAllocationTargetsUpdated?: SubscriptionResolver<ResolversTypes['UpdatedFundAllocationTargets'], "fundAllocationTargetsUpdated", ParentType, ContextType>;
  fundPricesUpdated?: SubscriptionResolver<Maybe<ResolversTypes['FundHistory']>, "fundPricesUpdated", ParentType, ContextType, RequireFields<SubscriptionFundPricesUpdatedArgs, never>>;
  fundsChanged?: SubscriptionResolver<ResolversTypes['FundSubscription'], "fundsChanged", ParentType, ContextType>;
  incomeChanged?: SubscriptionResolver<ResolversTypes['IncomeSubscription'], "incomeChanged", ParentType, ContextType>;
  listChanged?: SubscriptionResolver<ResolversTypes['ListSubscription'], "listChanged", ParentType, ContextType, RequireFields<SubscriptionListChangedArgs, 'pages'>>;
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
  allocationTarget?: Resolver<ResolversTypes['NonNegativeInt'], ParentType, ContextType>;
  id?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type TaxRateResolvers<ContextType = Context, ParentType extends ResolversParentTypes['TaxRate'] = ResolversParentTypes['TaxRate']> = {
  name?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  value?: Resolver<ResolversTypes['Float'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type TaxThresholdResolvers<ContextType = Context, ParentType extends ResolversParentTypes['TaxThreshold'] = ResolversParentTypes['TaxThreshold']> = {
  name?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  value?: Resolver<ResolversTypes['NonNegativeInt'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type TransactionResolvers<ContextType = Context, ParentType extends ResolversParentTypes['Transaction'] = ResolversParentTypes['Transaction']> = {
  date?: Resolver<ResolversTypes['Date'], ParentType, ContextType>;
  drip?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  fees?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  pension?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  price?: Resolver<ResolversTypes['NonNegativeFloat'], ParentType, ContextType>;
  taxes?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  units?: Resolver<ResolversTypes['Float'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type UpdatedFundAllocationTargetsResolvers<ContextType = Context, ParentType extends ResolversParentTypes['UpdatedFundAllocationTargets'] = ResolversParentTypes['UpdatedFundAllocationTargets']> = {
  deltas?: Resolver<Maybe<Array<ResolversTypes['TargetDeltaResponse']>>, ParentType, ContextType>;
  error?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type UserResolvers<ContextType = Context, ParentType extends ResolversParentTypes['User'] = ResolversParentTypes['User']> = {
  uid?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type UserInfoResolvers<ContextType = Context, ParentType extends ResolversParentTypes['UserInfo'] = ResolversParentTypes['UserInfo']> = {
  name?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  uid?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type Resolvers<ContextType = Context> = {
  AnalysisResponse?: AnalysisResponseResolvers<ContextType>;
  AppConfig?: AppConfigResolvers<ContextType>;
  AppConfigSet?: AppConfigSetResolvers<ContextType>;
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
  Fund?: FundResolvers<ContextType>;
  FundCreatedSubscription?: FundCreatedSubscriptionResolvers<ContextType>;
  FundHistory?: FundHistoryResolvers<ContextType>;
  FundHistoryIndividual?: FundHistoryIndividualResolvers<ContextType>;
  FundPriceGroup?: FundPriceGroupResolvers<ContextType>;
  FundPrices?: FundPricesResolvers<ContextType>;
  FundSubscription?: FundSubscriptionResolvers<ContextType>;
  FundValueIndividual?: FundValueIndividualResolvers<ContextType>;
  FXValue?: FxValueResolvers<ContextType>;
  Income?: IncomeResolvers<ContextType>;
  IncomeCreatedSubscription?: IncomeCreatedSubscriptionResolvers<ContextType>;
  IncomeDeduction?: IncomeDeductionResolvers<ContextType>;
  IncomeReadResponse?: IncomeReadResponseResolvers<ContextType>;
  IncomeSubscription?: IncomeSubscriptionResolvers<ContextType>;
  IncomeTotals?: IncomeTotalsResolvers<ContextType>;
  InitialCumulativeValues?: InitialCumulativeValuesResolvers<ContextType>;
  ListItem?: ListItemResolvers<ContextType>;
  ListItemStandard?: ListItemStandardResolvers<ContextType>;
  ListItemStandardCreatedSubscription?: ListItemStandardCreatedSubscriptionResolvers<ContextType>;
  ListReadResponse?: ListReadResponseResolvers<ContextType>;
  ListSubscription?: ListSubscriptionResolvers<ContextType>;
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
  NetWorthLoansResponse?: NetWorthLoansResponseResolvers<ContextType>;
  NetWorthLoanValue?: NetWorthLoanValueResolvers<ContextType>;
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
  PlanningAccount?: PlanningAccountResolvers<ContextType>;
  PlanningComputedValue?: PlanningComputedValueResolvers<ContextType>;
  PlanningCreditCard?: PlanningCreditCardResolvers<ContextType>;
  PlanningCreditCardPayment?: PlanningCreditCardPaymentResolvers<ContextType>;
  PlanningIncome?: PlanningIncomeResolvers<ContextType>;
  PlanningParameters?: PlanningParametersResolvers<ContextType>;
  PlanningSyncResponse?: PlanningSyncResponseResolvers<ContextType>;
  PlanningValue?: PlanningValueResolvers<ContextType>;
  PositiveInt?: GraphQLScalarType;
  Query?: QueryResolvers<ContextType>;
  ReadFundsResponse?: ReadFundsResponseResolvers<ContextType>;
  ReceiptCategory?: ReceiptCategoryResolvers<ContextType>;
  ReceiptCreated?: ReceiptCreatedResolvers<ContextType>;
  ReceiptItem?: ReceiptItemResolvers<ContextType>;
  SearchResult?: SearchResultResolvers<ContextType>;
  SimpleValue?: SimpleValueResolvers<ContextType>;
  StockPrice?: StockPriceResolvers<ContextType>;
  StockPricesResponse?: StockPricesResponseResolvers<ContextType>;
  StockSplit?: StockSplitResolvers<ContextType>;
  StockValueResponse?: StockValueResponseResolvers<ContextType>;
  Subscription?: SubscriptionResolvers<ContextType>;
  TargetDeltaResponse?: TargetDeltaResponseResolvers<ContextType>;
  TaxRate?: TaxRateResolvers<ContextType>;
  TaxThreshold?: TaxThresholdResolvers<ContextType>;
  Transaction?: TransactionResolvers<ContextType>;
  UpdatedFundAllocationTargets?: UpdatedFundAllocationTargetsResolvers<ContextType>;
  User?: UserResolvers<ContextType>;
  UserInfo?: UserInfoResolvers<ContextType>;
};


/**
 * @deprecated
 * Use "Resolvers" root object instead. If you wish to get "IResolvers", add "typesPrefix: I" to your config.
 */
export type IResolvers<ContextType = Context> = Resolvers<ContextType>;
