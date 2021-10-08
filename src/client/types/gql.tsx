import { gql } from 'urql';
import * as Urql from 'urql';
export type Maybe<T> = T | null;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type Omit<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>;
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: string;
  String: string;
  Boolean: boolean;
  Int: number;
  Float: number;
  Date: string;
  DateTime: string;
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
  __typename?: 'AnalysisResponse';
  cost: Array<CategoryCostTree>;
  description: Scalars['String'];
  startDate: Scalars['Date'];
  endDate: Scalars['Date'];
};

export type AppConfig = {
  __typename?: 'AppConfig';
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
  __typename?: 'AppConfigSet';
  config?: Maybe<AppConfig>;
  error?: Maybe<Scalars['String']>;
};

export type CategoryCostTree = {
  __typename?: 'CategoryCostTree';
  item: AnalysisPage;
  tree: Array<CategoryTreeItem>;
};

export type CategoryCostTreeDeep = {
  __typename?: 'CategoryCostTreeDeep';
  item: Scalars['String'];
  tree: Array<CategoryTreeItem>;
};

export type CategoryTreeItem = {
  __typename?: 'CategoryTreeItem';
  category: Scalars['String'];
  sum: Scalars['Int'];
};

export type CreditLimit = {
  __typename?: 'CreditLimit';
  subcategory: Scalars['Int'];
  value: Scalars['Int'];
};

export type CreditLimitInput = {
  subcategory: Scalars['Int'];
  value: Scalars['Int'];
};

export type CrudResponseCreate = {
  __typename?: 'CrudResponseCreate';
  error?: Maybe<Scalars['String']>;
  id?: Maybe<Scalars['Int']>;
};

export type CrudResponseDelete = {
  __typename?: 'CrudResponseDelete';
  error?: Maybe<Scalars['String']>;
};

export type CrudResponseUpdate = {
  __typename?: 'CrudResponseUpdate';
  error?: Maybe<Scalars['String']>;
};

export type Currency = {
  __typename?: 'Currency';
  currency: Scalars['String'];
  rate: Scalars['NonNegativeFloat'];
};

export type CurrencyInput = {
  currency: Scalars['String'];
  rate: Scalars['NonNegativeFloat'];
};



export type ExchangeRate = {
  __typename?: 'ExchangeRate';
  currency: Scalars['String'];
  rate: Scalars['NonNegativeFloat'];
};

export type ExchangeRatesResponse = {
  __typename?: 'ExchangeRatesResponse';
  error?: Maybe<Scalars['String']>;
  rates?: Maybe<Array<ExchangeRate>>;
};

export type FxValue = {
  __typename?: 'FXValue';
  value: Scalars['Float'];
  currency: Scalars['String'];
};

export type FxValueInput = {
  value: Scalars['Float'];
  currency: Scalars['String'];
};

export type Fund = {
  __typename?: 'Fund';
  id: Scalars['Int'];
  item: Scalars['String'];
  transactions: Array<Transaction>;
  allocationTarget?: Maybe<Scalars['NonNegativeInt']>;
  stockSplits: Array<StockSplit>;
};

export type FundCreatedSubscription = {
  __typename?: 'FundCreatedSubscription';
  fakeId: Scalars['Int'];
  item: Fund;
};

export type FundHistory = {
  __typename?: 'FundHistory';
  startTime: Scalars['Int'];
  cacheTimes: Array<Scalars['Int']>;
  prices: Array<FundPrices>;
  annualisedFundReturns: Scalars['Float'];
  overviewCost: Array<Scalars['Int']>;
};

export type FundHistoryIndividual = {
  __typename?: 'FundHistoryIndividual';
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
  Allocation = 'Allocation',
  Price = 'Price',
  PriceNormalised = 'PriceNormalised'
}

export enum FundPeriod {
  Year = 'year',
  Month = 'month',
  Ytd = 'ytd'
}

export type FundPriceGroup = {
  __typename?: 'FundPriceGroup';
  startIndex: Scalars['Int'];
  values: Array<Scalars['NonNegativeFloat']>;
};

export type FundPrices = {
  __typename?: 'FundPrices';
  fundId: Scalars['Int'];
  groups: Array<FundPriceGroup>;
};

export type FundSubscription = {
  __typename?: 'FundSubscription';
  created?: Maybe<FundCreatedSubscription>;
  updated?: Maybe<Fund>;
  deleted?: Maybe<Scalars['NonNegativeInt']>;
  overviewCost: Array<Scalars['Int']>;
};

export type FundValueIndividual = {
  __typename?: 'FundValueIndividual';
  date: Scalars['Int'];
  price: Scalars['NonNegativeFloat'];
};

export type Income = {
  __typename?: 'Income';
  id: Scalars['Int'];
  date: Scalars['Date'];
  item: Scalars['String'];
  category: Scalars['String'];
  cost: Scalars['Int'];
  shop: Scalars['String'];
  deductions: Array<IncomeDeduction>;
};

export type IncomeCreatedSubscription = {
  __typename?: 'IncomeCreatedSubscription';
  fakeId: Scalars['Int'];
  item: Income;
};

export type IncomeDeduction = {
  __typename?: 'IncomeDeduction';
  name: Scalars['String'];
  value: Scalars['Int'];
};

export type IncomeDeductionInput = {
  name: Scalars['String'];
  value: Scalars['Int'];
};

export type IncomeInput = {
  date: Scalars['String'];
  item: Scalars['String'];
  cost: Scalars['Int'];
  category: Scalars['String'];
  shop: Scalars['String'];
  deductions: Array<IncomeDeductionInput>;
};

export type IncomeReadResponse = {
  __typename?: 'IncomeReadResponse';
  error?: Maybe<Scalars['String']>;
  items: Array<Income>;
  olderExists?: Maybe<Scalars['Boolean']>;
  weekly?: Maybe<Scalars['Int']>;
  total?: Maybe<Scalars['Int']>;
};

export type IncomeSubscription = {
  __typename?: 'IncomeSubscription';
  created?: Maybe<IncomeCreatedSubscription>;
  updated?: Maybe<Income>;
  deleted?: Maybe<Scalars['NonNegativeInt']>;
  overviewCost: Array<Scalars['Int']>;
  total?: Maybe<Scalars['Int']>;
  weekly?: Maybe<Scalars['Int']>;
};

export type InitialCumulativeValues = {
  __typename?: 'InitialCumulativeValues';
  income: Scalars['Int'];
  spending: Scalars['Int'];
};

export type ListItem = {
  __typename?: 'ListItem';
  id: Scalars['Int'];
  item: Scalars['String'];
};

export type ListItemInput = {
  fakeId?: Maybe<Scalars['Int']>;
  item: Scalars['String'];
};

export type ListItemStandard = {
  __typename?: 'ListItemStandard';
  id: Scalars['Int'];
  date: Scalars['Date'];
  item: Scalars['String'];
  category: Scalars['String'];
  cost: Scalars['Int'];
  shop: Scalars['String'];
};

export type ListItemStandardCreatedSubscription = {
  __typename?: 'ListItemStandardCreatedSubscription';
  fakeId: Scalars['Int'];
  item: ListItemStandard;
};

export type ListItemStandardInput = {
  date: Scalars['String'];
  item: Scalars['String'];
  cost: Scalars['Int'];
  category: Scalars['String'];
  shop: Scalars['String'];
};

export type ListReadResponse = {
  __typename?: 'ListReadResponse';
  error?: Maybe<Scalars['String']>;
  items: Array<ListItemStandard>;
  olderExists?: Maybe<Scalars['Boolean']>;
  weekly?: Maybe<Scalars['Int']>;
  total?: Maybe<Scalars['Int']>;
};

export type ListSubscription = {
  __typename?: 'ListSubscription';
  page: PageListStandard;
  created?: Maybe<ListItemStandardCreatedSubscription>;
  updated?: Maybe<ListItemStandard>;
  deleted?: Maybe<Scalars['NonNegativeInt']>;
  overviewCost: Array<Scalars['Int']>;
  total?: Maybe<Scalars['Int']>;
  weekly?: Maybe<Scalars['Int']>;
};

export type ListTotalsResponse = {
  __typename?: 'ListTotalsResponse';
  error?: Maybe<Scalars['String']>;
  total?: Maybe<Scalars['Int']>;
  weekly?: Maybe<Scalars['Int']>;
};

export type LoanValue = {
  __typename?: 'LoanValue';
  principal: Scalars['NonNegativeInt'];
  paymentsRemaining: Scalars['NonNegativeInt'];
  rate: Scalars['Float'];
  paid?: Maybe<Scalars['Int']>;
};

export type LoanValueInput = {
  principal: Scalars['NonNegativeInt'];
  paymentsRemaining: Scalars['NonNegativeInt'];
  rate: Scalars['Float'];
  paid?: Maybe<Scalars['Int']>;
};

export type LoginResponse = {
  __typename?: 'LoginResponse';
  error?: Maybe<Scalars['String']>;
  uid?: Maybe<Scalars['Int']>;
  name?: Maybe<Scalars['String']>;
  apiKey?: Maybe<Scalars['String']>;
  expires?: Maybe<Scalars['DateTime']>;
};

export type LogoutResponse = {
  __typename?: 'LogoutResponse';
  error?: Maybe<Scalars['String']>;
  ok?: Maybe<Scalars['Boolean']>;
};

export type Monthly = {
  __typename?: 'Monthly';
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
  __typename?: 'Mutation';
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


export type MutationDeleteIncomeArgs = {
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


export type MutationSyncPlanningArgs = {
  year: Scalars['NonNegativeInt'];
  input?: Maybe<PlanningSync>;
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

export type NetWorthCashTotal = {
  __typename?: 'NetWorthCashTotal';
  cashInBank: Scalars['Int'];
  stockValue: Scalars['Int'];
  stocksIncludingCash: Scalars['Int'];
  date?: Maybe<Scalars['Date']>;
  incomeSince: Scalars['Int'];
  spendingSince: Scalars['Int'];
};

export type NetWorthCategory = {
  __typename?: 'NetWorthCategory';
  id: Scalars['Int'];
  type: NetWorthCategoryType;
  category: Scalars['String'];
  color: Scalars['String'];
  isOption?: Maybe<Scalars['Boolean']>;
};

export type NetWorthCategoryCreated = {
  __typename?: 'NetWorthCategoryCreated';
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
  __typename?: 'NetWorthCategoryUpdated';
  error?: Maybe<Scalars['String']>;
  item?: Maybe<NetWorthCategory>;
};

export type NetWorthDeleted = {
  __typename?: 'NetWorthDeleted';
  error?: Maybe<Scalars['String']>;
  id: Scalars['Int'];
};

export type NetWorthEntry = {
  __typename?: 'NetWorthEntry';
  id: Scalars['Int'];
  date: Scalars['Date'];
  values: Array<NetWorthValueObject>;
  creditLimit: Array<CreditLimit>;
  currencies: Array<Currency>;
};

export type NetWorthEntryCreated = {
  __typename?: 'NetWorthEntryCreated';
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
  __typename?: 'NetWorthEntryOverview';
  current: Array<NetWorthEntry>;
};

export type NetWorthEntryUpdated = {
  __typename?: 'NetWorthEntryUpdated';
  error?: Maybe<Scalars['String']>;
  item?: Maybe<NetWorthEntry>;
};

export type NetWorthLoan = {
  __typename?: 'NetWorthLoan';
  subcategory: Scalars['String'];
  values: Array<NetWorthLoanValue>;
};

export type NetWorthLoanValue = {
  __typename?: 'NetWorthLoanValue';
  date: Scalars['Date'];
  value: LoanValue;
};

export type NetWorthLoansResponse = {
  __typename?: 'NetWorthLoansResponse';
  error?: Maybe<Scalars['String']>;
  loans?: Maybe<Array<NetWorthLoan>>;
};

export type NetWorthSubcategory = {
  __typename?: 'NetWorthSubcategory';
  id: Scalars['Int'];
  categoryId: Scalars['Int'];
  subcategory: Scalars['String'];
  hasCreditLimit?: Maybe<Scalars['Boolean']>;
  appreciationRate?: Maybe<Scalars['Float']>;
  isSAYE?: Maybe<Scalars['Boolean']>;
  opacity?: Maybe<Scalars['Float']>;
};

export type NetWorthSubcategoryCreated = {
  __typename?: 'NetWorthSubcategoryCreated';
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
  __typename?: 'NetWorthSubcategoryUpdated';
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
  __typename?: 'NetWorthValueObject';
  subcategory: Scalars['Int'];
  skip?: Maybe<Scalars['Boolean']>;
  value: Scalars['Int'];
  simple?: Maybe<Scalars['Int']>;
  fx?: Maybe<Array<FxValue>>;
  option?: Maybe<OptionValue>;
  loan?: Maybe<LoanValue>;
};



export type OptionValue = {
  __typename?: 'OptionValue';
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
  __typename?: 'Overview';
  startDate: Scalars['Date'];
  endDate: Scalars['Date'];
  monthly: Monthly;
  initialCumulativeValues: InitialCumulativeValues;
};

export type OverviewOld = {
  __typename?: 'OverviewOld';
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
  __typename?: 'OverviewPreview';
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

export type PlanningAccount = {
  __typename?: 'PlanningAccount';
  id: Scalars['NonNegativeInt'];
  account: Scalars['String'];
  netWorthSubcategoryId: Scalars['NonNegativeInt'];
  income: Array<PlanningIncome>;
  creditCards: Array<PlanningCreditCard>;
  values: Array<PlanningValue>;
  computedValues: Array<PlanningComputedValue>;
  computedStartValue?: Maybe<Scalars['Int']>;
  upperLimit?: Maybe<Scalars['Int']>;
  lowerLimit?: Maybe<Scalars['Int']>;
};

export type PlanningAccountInput = {
  id?: Maybe<Scalars['NonNegativeInt']>;
  account: Scalars['String'];
  netWorthSubcategoryId: Scalars['NonNegativeInt'];
  income: Array<PlanningIncomeInput>;
  creditCards: Array<PlanningCreditCardInput>;
  values: Array<PlanningValueInput>;
  upperLimit?: Maybe<Scalars['Int']>;
  lowerLimit?: Maybe<Scalars['Int']>;
};

export type PlanningComputedValue = {
  __typename?: 'PlanningComputedValue';
  key: Scalars['String'];
  month: Scalars['NonNegativeInt'];
  name: Scalars['String'];
  value: Scalars['Int'];
  isVerified: Scalars['Boolean'];
  isTransfer: Scalars['Boolean'];
};

export type PlanningCreditCard = {
  __typename?: 'PlanningCreditCard';
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
  __typename?: 'PlanningCreditCardPayment';
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
  __typename?: 'PlanningIncome';
  id: Scalars['NonNegativeInt'];
  startDate: Scalars['Date'];
  endDate: Scalars['Date'];
  salary: Scalars['NonNegativeInt'];
  taxCode: Scalars['String'];
  pensionContrib: Scalars['Float'];
  studentLoan: Scalars['Boolean'];
};

export type PlanningIncomeInput = {
  id?: Maybe<Scalars['NonNegativeInt']>;
  startDate: Scalars['Date'];
  endDate: Scalars['Date'];
  salary: Scalars['NonNegativeInt'];
  taxCode: Scalars['String'];
  pensionContrib: Scalars['Float'];
  studentLoan: Scalars['Boolean'];
};

export type PlanningParameters = {
  __typename?: 'PlanningParameters';
  rates: Array<TaxRate>;
  thresholds: Array<TaxThreshold>;
};

export type PlanningParametersInput = {
  rates: Array<PlanningTaxRateInput>;
  thresholds: Array<PlanningTaxThresholdInput>;
};

export type PlanningSync = {
  parameters: PlanningParametersInput;
  accounts: Array<PlanningAccountInput>;
};

export type PlanningSyncResponse = {
  __typename?: 'PlanningSyncResponse';
  error?: Maybe<Scalars['String']>;
  year?: Maybe<Scalars['NonNegativeInt']>;
  parameters?: Maybe<PlanningParameters>;
  accounts?: Maybe<Array<PlanningAccount>>;
  taxReliefFromPreviousYear?: Maybe<Scalars['Int']>;
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
  __typename?: 'PlanningValue';
  id: Scalars['NonNegativeInt'];
  month: Scalars['NonNegativeInt'];
  transferToAccountId?: Maybe<Scalars['NonNegativeInt']>;
  name: Scalars['String'];
  value?: Maybe<Scalars['Int']>;
  formula?: Maybe<Scalars['String']>;
};

export type PlanningValueInput = {
  id?: Maybe<Scalars['NonNegativeInt']>;
  month: Scalars['NonNegativeInt'];
  transferToAccountId?: Maybe<Scalars['NonNegativeInt']>;
  name: Scalars['String'];
  value?: Maybe<Scalars['Int']>;
  formula?: Maybe<Scalars['String']>;
};


export type Query = {
  __typename?: 'Query';
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
  offset?: Maybe<Scalars['Int']>;
  limit?: Maybe<Scalars['Int']>;
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
  __typename?: 'ReadFundsResponse';
  items: Array<Fund>;
};

export type ReceiptCategory = {
  __typename?: 'ReceiptCategory';
  item: Scalars['String'];
  page: ReceiptPage;
  category: Scalars['String'];
};

export type ReceiptCreated = {
  __typename?: 'ReceiptCreated';
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
  __typename?: 'ReceiptItem';
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
  __typename?: 'SearchResult';
  error?: Maybe<Scalars['String']>;
  searchTerm?: Maybe<Scalars['String']>;
  list: Array<Scalars['String']>;
  nextCategory?: Maybe<Array<Scalars['String']>>;
  nextField?: Maybe<Scalars['String']>;
};

export type SimpleValue = {
  __typename?: 'SimpleValue';
  value: Scalars['Int'];
};

export type StockPrice = {
  __typename?: 'StockPrice';
  code: Scalars['String'];
  price?: Maybe<Scalars['NonNegativeFloat']>;
};

export type StockPricesResponse = {
  __typename?: 'StockPricesResponse';
  error?: Maybe<Scalars['String']>;
  prices: Array<StockPrice>;
  refreshTime?: Maybe<Scalars['DateTime']>;
};

export type StockSplit = {
  __typename?: 'StockSplit';
  date: Scalars['Date'];
  ratio: Scalars['NonNegativeFloat'];
};

export type StockSplitInput = {
  date: Scalars['Date'];
  ratio: Scalars['NonNegativeFloat'];
};

export type StockValueResponse = {
  __typename?: 'StockValueResponse';
  error?: Maybe<Scalars['String']>;
  latestValue?: Maybe<Scalars['Int']>;
  previousValue?: Maybe<Scalars['Int']>;
  refreshTime?: Maybe<Scalars['DateTime']>;
};

export type Subscription = {
  __typename?: 'Subscription';
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
  period?: Maybe<FundPeriod>;
  length?: Maybe<Scalars['NonNegativeInt']>;
};


export type SubscriptionListChangedArgs = {
  pages: Array<PageListStandard>;
};

export type TargetDelta = {
  id: Scalars['Int'];
  allocationTarget: Scalars['NonNegativeInt'];
};

export type TargetDeltaResponse = {
  __typename?: 'TargetDeltaResponse';
  id: Scalars['Int'];
  allocationTarget: Scalars['NonNegativeInt'];
};

export type TaxRate = {
  __typename?: 'TaxRate';
  name: Scalars['String'];
  value: Scalars['Float'];
};

export type TaxThreshold = {
  __typename?: 'TaxThreshold';
  name: Scalars['String'];
  value: Scalars['NonNegativeInt'];
};

export type Transaction = {
  __typename?: 'Transaction';
  date: Scalars['Date'];
  units: Scalars['Float'];
  price: Scalars['NonNegativeFloat'];
  fees: Scalars['Int'];
  taxes: Scalars['Int'];
  drip: Scalars['Boolean'];
  pension: Scalars['Boolean'];
};

export type TransactionInput = {
  date: Scalars['Date'];
  units: Scalars['Float'];
  price: Scalars['NonNegativeFloat'];
  fees: Scalars['Int'];
  taxes: Scalars['Int'];
  drip: Scalars['Boolean'];
  pension: Scalars['Boolean'];
};

export type UpdatedFundAllocationTargets = {
  __typename?: 'UpdatedFundAllocationTargets';
  error?: Maybe<Scalars['String']>;
  deltas?: Maybe<Array<TargetDeltaResponse>>;
};

export type User = {
  __typename?: 'User';
  uid: Scalars['Int'];
};

export type UserInfo = {
  __typename?: 'UserInfo';
  uid: Scalars['Int'];
  name: Scalars['String'];
};

export type ConfigPartsFragment = (
  { __typename?: 'AppConfig' }
  & Pick<AppConfig, 'birthDate' | 'futureMonths' | 'realTimePrices' | 'fundMode' | 'fundPeriod' | 'fundLength'>
);

export type FundPartsFragment = (
  { __typename?: 'Fund' }
  & Pick<Fund, 'id' | 'item' | 'allocationTarget'>
  & { transactions: Array<(
    { __typename?: 'Transaction' }
    & Pick<Transaction, 'date' | 'units' | 'price' | 'fees' | 'taxes' | 'drip' | 'pension'>
  )>, stockSplits: Array<(
    { __typename?: 'StockSplit' }
    & Pick<StockSplit, 'date' | 'ratio'>
  )> }
);

export type FundHistoryPartsFragment = (
  { __typename?: 'FundHistory' }
  & Pick<FundHistory, 'startTime' | 'cacheTimes' | 'annualisedFundReturns' | 'overviewCost'>
  & { prices: Array<(
    { __typename?: 'FundPrices' }
    & Pick<FundPrices, 'fundId'>
    & { groups: Array<(
      { __typename?: 'FundPriceGroup' }
      & Pick<FundPriceGroup, 'startIndex' | 'values'>
    )> }
  )> }
);

export type ListItemStandardPartsFragment = (
  { __typename?: 'ListItemStandard' }
  & Pick<ListItemStandard, 'id' | 'date' | 'item' | 'category' | 'cost' | 'shop'>
);

export type IncomePartsFragment = (
  { __typename?: 'Income' }
  & Pick<Income, 'id' | 'date' | 'item' | 'category' | 'cost' | 'shop'>
  & { deductions: Array<(
    { __typename?: 'IncomeDeduction' }
    & Pick<IncomeDeduction, 'name' | 'value'>
  )> }
);

export type NetWorthCategoryPartsFragment = (
  { __typename?: 'NetWorthCategory' }
  & Pick<NetWorthCategory, 'type' | 'category' | 'isOption' | 'color'>
);

export type NetWorthSubcategoryPartsFragment = (
  { __typename?: 'NetWorthSubcategory' }
  & Pick<NetWorthSubcategory, 'categoryId' | 'subcategory' | 'hasCreditLimit' | 'appreciationRate' | 'isSAYE' | 'opacity'>
);

export type NetWorthEntryPartsFragment = (
  { __typename?: 'NetWorthEntry' }
  & Pick<NetWorthEntry, 'date'>
  & { values: Array<(
    { __typename?: 'NetWorthValueObject' }
    & Pick<NetWorthValueObject, 'subcategory' | 'skip' | 'simple'>
    & { fx?: Maybe<Array<(
      { __typename?: 'FXValue' }
      & Pick<FxValue, 'value' | 'currency'>
    )>>, option?: Maybe<(
      { __typename?: 'OptionValue' }
      & Pick<OptionValue, 'units' | 'strikePrice' | 'marketPrice' | 'vested'>
    )>, loan?: Maybe<(
      { __typename?: 'LoanValue' }
      & Pick<LoanValue, 'principal' | 'paymentsRemaining' | 'rate' | 'paid'>
    )> }
  )>, creditLimit: Array<(
    { __typename?: 'CreditLimit' }
    & Pick<CreditLimit, 'subcategory' | 'value'>
  )>, currencies: Array<(
    { __typename?: 'Currency' }
    & Pick<Currency, 'currency' | 'rate'>
  )> }
);

export type PlanningParametersPartsFragment = (
  { __typename?: 'PlanningParameters' }
  & { rates: Array<(
    { __typename?: 'TaxRate' }
    & Pick<TaxRate, 'name' | 'value'>
  )>, thresholds: Array<(
    { __typename?: 'TaxThreshold' }
    & Pick<TaxThreshold, 'name' | 'value'>
  )> }
);

export type PlanningAccountPartsFragment = (
  { __typename?: 'PlanningAccount' }
  & Pick<PlanningAccount, 'id' | 'account' | 'netWorthSubcategoryId' | 'upperLimit' | 'lowerLimit' | 'computedStartValue'>
  & { income: Array<(
    { __typename?: 'PlanningIncome' }
    & Pick<PlanningIncome, 'id' | 'startDate' | 'endDate' | 'salary' | 'taxCode' | 'pensionContrib' | 'studentLoan'>
  )>, creditCards: Array<(
    { __typename?: 'PlanningCreditCard' }
    & Pick<PlanningCreditCard, 'id' | 'netWorthSubcategoryId' | 'predictedPayment'>
    & { payments: Array<(
      { __typename?: 'PlanningCreditCardPayment' }
      & Pick<PlanningCreditCardPayment, 'id' | 'month' | 'value'>
    )> }
  )>, values: Array<(
    { __typename?: 'PlanningValue' }
    & Pick<PlanningValue, 'id' | 'month' | 'transferToAccountId' | 'name' | 'value' | 'formula'>
  )>, computedValues: Array<(
    { __typename?: 'PlanningComputedValue' }
    & Pick<PlanningComputedValue, 'key' | 'month' | 'name' | 'value' | 'isVerified' | 'isTransfer'>
  )> }
);

export type SetConfigMutationVariables = Exact<{
  config: AppConfigInput;
}>;


export type SetConfigMutation = (
  { __typename?: 'Mutation' }
  & { setConfig?: Maybe<(
    { __typename?: 'AppConfigSet' }
    & { config?: Maybe<(
      { __typename?: 'AppConfig' }
      & ConfigPartsFragment
    )> }
  )> }
);

export type CreateFundMutationVariables = Exact<{
  fakeId: Scalars['Int'];
  input: FundInput;
}>;


export type CreateFundMutation = (
  { __typename?: 'Mutation' }
  & { createFund?: Maybe<(
    { __typename?: 'CrudResponseCreate' }
    & Pick<CrudResponseCreate, 'error' | 'id'>
  )> }
);

export type UpdateFundMutationVariables = Exact<{
  id: Scalars['Int'];
  input: FundInput;
}>;


export type UpdateFundMutation = (
  { __typename?: 'Mutation' }
  & { updateFund?: Maybe<(
    { __typename?: 'CrudResponseUpdate' }
    & Pick<CrudResponseUpdate, 'error'>
  )> }
);

export type DeleteFundMutationVariables = Exact<{
  id: Scalars['Int'];
}>;


export type DeleteFundMutation = (
  { __typename?: 'Mutation' }
  & { deleteFund?: Maybe<(
    { __typename?: 'CrudResponseDelete' }
    & Pick<CrudResponseDelete, 'error'>
  )> }
);

export type UpdateCashAllocationTargetMutationVariables = Exact<{
  target: Scalars['NonNegativeInt'];
}>;


export type UpdateCashAllocationTargetMutation = (
  { __typename?: 'Mutation' }
  & { updateCashAllocationTarget?: Maybe<(
    { __typename?: 'CrudResponseUpdate' }
    & Pick<CrudResponseUpdate, 'error'>
  )> }
);

export type UpdateFundAllocationTargetsMutationVariables = Exact<{
  deltas: Array<TargetDelta> | TargetDelta;
}>;


export type UpdateFundAllocationTargetsMutation = (
  { __typename?: 'Mutation' }
  & { updateFundAllocationTargets?: Maybe<(
    { __typename?: 'UpdatedFundAllocationTargets' }
    & Pick<UpdatedFundAllocationTargets, 'error'>
    & { deltas?: Maybe<Array<(
      { __typename?: 'TargetDeltaResponse' }
      & Pick<TargetDeltaResponse, 'id' | 'allocationTarget'>
    )>> }
  )> }
);

export type CreateIncomeMutationVariables = Exact<{
  fakeId: Scalars['Int'];
  input: IncomeInput;
}>;


export type CreateIncomeMutation = (
  { __typename?: 'Mutation' }
  & { createIncome?: Maybe<(
    { __typename?: 'CrudResponseCreate' }
    & Pick<CrudResponseCreate, 'error' | 'id'>
  )> }
);

export type UpdateIncomeMutationVariables = Exact<{
  id: Scalars['Int'];
  input: IncomeInput;
}>;


export type UpdateIncomeMutation = (
  { __typename?: 'Mutation' }
  & { updateIncome?: Maybe<(
    { __typename?: 'CrudResponseUpdate' }
    & Pick<CrudResponseUpdate, 'error'>
  )> }
);

export type DeleteIncomeMutationVariables = Exact<{
  id: Scalars['Int'];
}>;


export type DeleteIncomeMutation = (
  { __typename?: 'Mutation' }
  & { deleteIncome?: Maybe<(
    { __typename?: 'CrudResponseDelete' }
    & Pick<CrudResponseDelete, 'error'>
  )> }
);

export type CreateListItemMutationVariables = Exact<{
  page: PageListStandard;
  fakeId: Scalars['Int'];
  input: ListItemStandardInput;
}>;


export type CreateListItemMutation = (
  { __typename?: 'Mutation' }
  & { createListItem?: Maybe<(
    { __typename?: 'CrudResponseCreate' }
    & Pick<CrudResponseCreate, 'error' | 'id'>
  )> }
);

export type UpdateListItemMutationVariables = Exact<{
  page: PageListStandard;
  id: Scalars['Int'];
  input: ListItemStandardInput;
}>;


export type UpdateListItemMutation = (
  { __typename?: 'Mutation' }
  & { updateListItem?: Maybe<(
    { __typename?: 'CrudResponseUpdate' }
    & Pick<CrudResponseUpdate, 'error'>
  )> }
);

export type DeleteListItemMutationVariables = Exact<{
  page: PageListStandard;
  id: Scalars['Int'];
}>;


export type DeleteListItemMutation = (
  { __typename?: 'Mutation' }
  & { deleteListItem?: Maybe<(
    { __typename?: 'CrudResponseDelete' }
    & Pick<CrudResponseDelete, 'error'>
  )> }
);

export type CreateReceiptMutationVariables = Exact<{
  date: Scalars['Date'];
  shop: Scalars['String'];
  items: Array<ReceiptInput> | ReceiptInput;
}>;


export type CreateReceiptMutation = (
  { __typename?: 'Mutation' }
  & { createReceipt?: Maybe<(
    { __typename?: 'ReceiptCreated' }
    & Pick<ReceiptCreated, 'error'>
  )> }
);

export type LoginMutationVariables = Exact<{
  pin: Scalars['Int'];
}>;


export type LoginMutation = (
  { __typename?: 'Mutation' }
  & { login: (
    { __typename?: 'LoginResponse' }
    & Pick<LoginResponse, 'error' | 'uid' | 'name' | 'apiKey' | 'expires'>
  ) }
);

export type LogoutMutationVariables = Exact<{ [key: string]: never; }>;


export type LogoutMutation = (
  { __typename?: 'Mutation' }
  & { logout: (
    { __typename?: 'LogoutResponse' }
    & Pick<LogoutResponse, 'error' | 'ok'>
  ) }
);

export type CreateNetWorthCategoryMutationVariables = Exact<{
  input: NetWorthCategoryInput;
}>;


export type CreateNetWorthCategoryMutation = (
  { __typename?: 'Mutation' }
  & { createNetWorthCategory?: Maybe<(
    { __typename?: 'CrudResponseCreate' }
    & Pick<CrudResponseCreate, 'id' | 'error'>
  )> }
);

export type UpdateNetWorthCategoryMutationVariables = Exact<{
  id: Scalars['Int'];
  input: NetWorthCategoryInput;
}>;


export type UpdateNetWorthCategoryMutation = (
  { __typename?: 'Mutation' }
  & { updateNetWorthCategory?: Maybe<(
    { __typename?: 'CrudResponseUpdate' }
    & Pick<CrudResponseUpdate, 'error'>
  )> }
);

export type DeleteNetWorthCategoryMutationVariables = Exact<{
  id: Scalars['Int'];
}>;


export type DeleteNetWorthCategoryMutation = (
  { __typename?: 'Mutation' }
  & { deleteNetWorthCategory?: Maybe<(
    { __typename?: 'CrudResponseDelete' }
    & Pick<CrudResponseDelete, 'error'>
  )> }
);

export type CreateNetWorthSubcategoryMutationVariables = Exact<{
  input: NetWorthSubcategoryInput;
}>;


export type CreateNetWorthSubcategoryMutation = (
  { __typename?: 'Mutation' }
  & { createNetWorthSubcategory?: Maybe<(
    { __typename?: 'CrudResponseCreate' }
    & Pick<CrudResponseCreate, 'id' | 'error'>
  )> }
);

export type UpdateNetWorthSubcategoryMutationVariables = Exact<{
  id: Scalars['Int'];
  input: NetWorthSubcategoryInput;
}>;


export type UpdateNetWorthSubcategoryMutation = (
  { __typename?: 'Mutation' }
  & { updateNetWorthSubcategory?: Maybe<(
    { __typename?: 'CrudResponseUpdate' }
    & Pick<CrudResponseUpdate, 'error'>
  )> }
);

export type DeleteNetWorthSubcategoryMutationVariables = Exact<{
  id: Scalars['Int'];
}>;


export type DeleteNetWorthSubcategoryMutation = (
  { __typename?: 'Mutation' }
  & { deleteNetWorthSubcategory?: Maybe<(
    { __typename?: 'CrudResponseDelete' }
    & Pick<CrudResponseDelete, 'error'>
  )> }
);

export type CreateNetWorthEntryMutationVariables = Exact<{
  input: NetWorthEntryInput;
}>;


export type CreateNetWorthEntryMutation = (
  { __typename?: 'Mutation' }
  & { createNetWorthEntry?: Maybe<(
    { __typename?: 'CrudResponseCreate' }
    & Pick<CrudResponseCreate, 'id' | 'error'>
  )> }
);

export type UpdateNetWorthEntryMutationVariables = Exact<{
  id: Scalars['Int'];
  input: NetWorthEntryInput;
}>;


export type UpdateNetWorthEntryMutation = (
  { __typename?: 'Mutation' }
  & { updateNetWorthEntry?: Maybe<(
    { __typename?: 'CrudResponseUpdate' }
    & Pick<CrudResponseUpdate, 'error'>
  )> }
);

export type DeleteNetWorthEntryMutationVariables = Exact<{
  id: Scalars['Int'];
}>;


export type DeleteNetWorthEntryMutation = (
  { __typename?: 'Mutation' }
  & { deleteNetWorthEntry?: Maybe<(
    { __typename?: 'CrudResponseDelete' }
    & Pick<CrudResponseDelete, 'error'>
  )> }
);

export type SyncPlanningMutationVariables = Exact<{
  year: Scalars['NonNegativeInt'];
  input?: Maybe<PlanningSync>;
}>;


export type SyncPlanningMutation = (
  { __typename?: 'Mutation' }
  & { syncPlanning?: Maybe<(
    { __typename?: 'PlanningSyncResponse' }
    & Pick<PlanningSyncResponse, 'error' | 'year' | 'taxReliefFromPreviousYear'>
    & { parameters?: Maybe<(
      { __typename?: 'PlanningParameters' }
      & PlanningParametersPartsFragment
    )>, accounts?: Maybe<Array<(
      { __typename?: 'PlanningAccount' }
      & PlanningAccountPartsFragment
    )>> }
  )> }
);

export type AnalysisQueryVariables = Exact<{
  period: AnalysisPeriod;
  groupBy: AnalysisGroupBy;
  page?: Maybe<Scalars['Int']>;
}>;


export type AnalysisQuery = (
  { __typename?: 'Query' }
  & { analysis?: Maybe<(
    { __typename?: 'AnalysisResponse' }
    & Pick<AnalysisResponse, 'description' | 'startDate' | 'endDate'>
    & { cost: Array<(
      { __typename?: 'CategoryCostTree' }
      & Pick<CategoryCostTree, 'item'>
      & { tree: Array<(
        { __typename?: 'CategoryTreeItem' }
        & Pick<CategoryTreeItem, 'category' | 'sum'>
      )> }
    )> }
  )> }
);

export type AnalysisDeepQueryVariables = Exact<{
  category: AnalysisPage;
  period: AnalysisPeriod;
  groupBy: AnalysisGroupBy;
  page?: Maybe<Scalars['Int']>;
}>;


export type AnalysisDeepQuery = (
  { __typename?: 'Query' }
  & { analysisDeep?: Maybe<Array<(
    { __typename?: 'CategoryCostTreeDeep' }
    & Pick<CategoryCostTreeDeep, 'item'>
    & { tree: Array<(
      { __typename?: 'CategoryTreeItem' }
      & Pick<CategoryTreeItem, 'category' | 'sum'>
    )> }
  )>> }
);

export type ExchangeRatesQueryVariables = Exact<{
  base: Scalars['String'];
}>;


export type ExchangeRatesQuery = (
  { __typename?: 'Query' }
  & { exchangeRates?: Maybe<(
    { __typename?: 'ExchangeRatesResponse' }
    & Pick<ExchangeRatesResponse, 'error'>
    & { rates?: Maybe<Array<(
      { __typename?: 'ExchangeRate' }
      & Pick<ExchangeRate, 'currency' | 'rate'>
    )>> }
  )> }
);

export type FundPricesUpdateQueryVariables = Exact<{
  period?: Maybe<FundPeriod>;
  length?: Maybe<Scalars['NonNegativeInt']>;
}>;


export type FundPricesUpdateQuery = (
  { __typename?: 'Query' }
  & { fundHistory?: Maybe<(
    { __typename?: 'FundHistory' }
    & FundHistoryPartsFragment
  )> }
);

export type StockPricesQueryVariables = Exact<{
  codes: Array<Scalars['String']> | Scalars['String'];
}>;


export type StockPricesQuery = (
  { __typename?: 'Query' }
  & { stockPrices?: Maybe<(
    { __typename?: 'StockPricesResponse' }
    & Pick<StockPricesResponse, 'refreshTime'>
    & { prices: Array<(
      { __typename?: 'StockPrice' }
      & Pick<StockPrice, 'code' | 'price'>
    )> }
  )> }
);

export type FundHistoryIndividualQueryVariables = Exact<{
  id: Scalars['NonNegativeInt'];
}>;


export type FundHistoryIndividualQuery = (
  { __typename?: 'Query' }
  & { fundHistoryIndividual?: Maybe<(
    { __typename?: 'FundHistoryIndividual' }
    & { values: Array<(
      { __typename?: 'FundValueIndividual' }
      & Pick<FundValueIndividual, 'date' | 'price'>
    )> }
  )> }
);

export type InitialQueryVariables = Exact<{
  fundPeriod?: Maybe<FundPeriod>;
  fundLength?: Maybe<Scalars['NonNegativeInt']>;
}>;


export type InitialQuery = (
  { __typename?: 'Query' }
  & Pick<Query, 'cashAllocationTarget'>
  & { config?: Maybe<(
    { __typename?: 'AppConfig' }
    & ConfigPartsFragment
  )>, overview?: Maybe<(
    { __typename?: 'Overview' }
    & Pick<Overview, 'startDate' | 'endDate'>
    & { monthly: (
      { __typename?: 'Monthly' }
      & Pick<Monthly, 'investmentPurchases' | 'income' | 'bills' | 'food' | 'general' | 'holiday' | 'social'>
    ), initialCumulativeValues: (
      { __typename?: 'InitialCumulativeValues' }
      & Pick<InitialCumulativeValues, 'income' | 'spending'>
    ) }
  )>, netWorthCategories?: Maybe<Array<(
    { __typename?: 'NetWorthCategory' }
    & Pick<NetWorthCategory, 'id'>
    & NetWorthCategoryPartsFragment
  )>>, netWorthSubcategories?: Maybe<Array<(
    { __typename?: 'NetWorthSubcategory' }
    & Pick<NetWorthSubcategory, 'id'>
    & NetWorthSubcategoryPartsFragment
  )>>, netWorthEntries?: Maybe<(
    { __typename?: 'NetWorthEntryOverview' }
    & { current: Array<(
      { __typename?: 'NetWorthEntry' }
      & Pick<NetWorthEntry, 'id'>
      & NetWorthEntryPartsFragment
    )> }
  )>, netWorthCashTotal?: Maybe<(
    { __typename?: 'NetWorthCashTotal' }
    & Pick<NetWorthCashTotal, 'cashInBank' | 'stockValue' | 'stocksIncludingCash' | 'date' | 'incomeSince' | 'spendingSince'>
  )>, funds?: Maybe<(
    { __typename?: 'ReadFundsResponse' }
    & { items: Array<(
      { __typename?: 'Fund' }
      & FundPartsFragment
    )> }
  )>, fundHistory?: Maybe<(
    { __typename?: 'FundHistory' }
    & FundHistoryPartsFragment
  )> }
);

export type MoreListDataStandardQueryVariables = Exact<{
  page: PageListStandard;
  offset: Scalars['Int'];
  limit: Scalars['Int'];
}>;


export type MoreListDataStandardQuery = (
  { __typename?: 'Query' }
  & { readListStandard?: Maybe<(
    { __typename?: 'ListReadResponse' }
    & Pick<ListReadResponse, 'total' | 'weekly' | 'olderExists'>
    & { items: Array<(
      { __typename?: 'ListItemStandard' }
      & Pick<ListItemStandard, 'id' | 'date' | 'item' | 'cost' | 'category' | 'shop'>
    )> }
  )> }
);

export type MoreIncomeDataQueryVariables = Exact<{
  offset: Scalars['Int'];
  limit: Scalars['Int'];
}>;


export type MoreIncomeDataQuery = (
  { __typename?: 'Query' }
  & { readIncome?: Maybe<(
    { __typename?: 'IncomeReadResponse' }
    & Pick<IncomeReadResponse, 'total' | 'weekly' | 'olderExists'>
    & { items: Array<(
      { __typename?: 'Income' }
      & Pick<Income, 'id' | 'date' | 'item' | 'cost' | 'category' | 'shop'>
      & { deductions: Array<(
        { __typename?: 'IncomeDeduction' }
        & Pick<IncomeDeduction, 'name' | 'value'>
      )> }
    )> }
  )> }
);

export type NetWorthLoansQueryVariables = Exact<{ [key: string]: never; }>;


export type NetWorthLoansQuery = (
  { __typename?: 'Query' }
  & { netWorthLoans?: Maybe<(
    { __typename?: 'NetWorthLoansResponse' }
    & { loans?: Maybe<Array<(
      { __typename?: 'NetWorthLoan' }
      & Pick<NetWorthLoan, 'subcategory'>
      & { values: Array<(
        { __typename?: 'NetWorthLoanValue' }
        & Pick<NetWorthLoanValue, 'date'>
        & { value: (
          { __typename?: 'LoanValue' }
          & Pick<LoanValue, 'principal' | 'rate' | 'paymentsRemaining' | 'paid'>
        ) }
      )> }
    )>> }
  )> }
);

export type OverviewOldQueryVariables = Exact<{
  now?: Maybe<Scalars['Date']>;
}>;


export type OverviewOldQuery = (
  { __typename?: 'Query' }
  & { overviewOld?: Maybe<(
    { __typename?: 'OverviewOld' }
    & Pick<OverviewOld, 'startDate' | 'stocks' | 'investmentPurchases' | 'pension' | 'cashLiquid' | 'cashOther' | 'investments' | 'illiquidEquity' | 'assets' | 'liabilities' | 'options' | 'netWorth' | 'income' | 'spending'>
  )> }
);

export type OverviewPreviewQueryVariables = Exact<{
  category: MonthlyCategory;
  date: Scalars['Date'];
}>;


export type OverviewPreviewQuery = (
  { __typename?: 'Query' }
  & { overviewPreview?: Maybe<(
    { __typename?: 'OverviewPreview' }
    & Pick<OverviewPreview, 'startDate' | 'values'>
  )> }
);

export type SearchSuggestionsQueryVariables = Exact<{
  page: SearchPage;
  column: SearchItem;
  searchTerm: Scalars['String'];
  numResults?: Maybe<Scalars['Int']>;
}>;


export type SearchSuggestionsQuery = (
  { __typename?: 'Query' }
  & { search?: Maybe<(
    { __typename?: 'SearchResult' }
    & Pick<SearchResult, 'error' | 'searchTerm' | 'list' | 'nextCategory' | 'nextField'>
  )> }
);

export type ReceiptItemQueryVariables = Exact<{
  item: Scalars['String'];
}>;


export type ReceiptItemQuery = (
  { __typename?: 'Query' }
  & Pick<Query, 'receiptItem'>
);

export type ReceiptItemsQueryVariables = Exact<{
  items: Array<Scalars['String']> | Scalars['String'];
}>;


export type ReceiptItemsQuery = (
  { __typename?: 'Query' }
  & { receiptItems?: Maybe<Array<(
    { __typename?: 'ReceiptCategory' }
    & Pick<ReceiptCategory, 'page' | 'item' | 'category'>
  )>> }
);

export type ConfigUpdatedSubscriptionVariables = Exact<{ [key: string]: never; }>;


export type ConfigUpdatedSubscription = (
  { __typename?: 'Subscription' }
  & { configUpdated: (
    { __typename?: 'AppConfig' }
    & ConfigPartsFragment
  ) }
);

export type FundsChangedSubscriptionVariables = Exact<{ [key: string]: never; }>;


export type FundsChangedSubscription = (
  { __typename?: 'Subscription' }
  & { fundsChanged: (
    { __typename?: 'FundSubscription' }
    & Pick<FundSubscription, 'deleted' | 'overviewCost'>
    & { created?: Maybe<(
      { __typename?: 'FundCreatedSubscription' }
      & Pick<FundCreatedSubscription, 'fakeId'>
      & { item: (
        { __typename?: 'Fund' }
        & FundPartsFragment
      ) }
    )>, updated?: Maybe<(
      { __typename?: 'Fund' }
      & FundPartsFragment
    )> }
  ) }
);

export type FundPricesUpdatedSubscriptionVariables = Exact<{
  period?: Maybe<FundPeriod>;
  length?: Maybe<Scalars['NonNegativeInt']>;
}>;


export type FundPricesUpdatedSubscription = (
  { __typename?: 'Subscription' }
  & { fundPricesUpdated?: Maybe<(
    { __typename?: 'FundHistory' }
    & FundHistoryPartsFragment
  )> }
);

export type CashAllocationTargetUpdatedSubscriptionVariables = Exact<{ [key: string]: never; }>;


export type CashAllocationTargetUpdatedSubscription = (
  { __typename?: 'Subscription' }
  & Pick<Subscription, 'cashAllocationTargetUpdated'>
);

export type FundAllocationTargetsUpdatedSubscriptionVariables = Exact<{ [key: string]: never; }>;


export type FundAllocationTargetsUpdatedSubscription = (
  { __typename?: 'Subscription' }
  & { fundAllocationTargetsUpdated: (
    { __typename?: 'UpdatedFundAllocationTargets' }
    & { deltas?: Maybe<Array<(
      { __typename?: 'TargetDeltaResponse' }
      & Pick<TargetDeltaResponse, 'id' | 'allocationTarget'>
    )>> }
  ) }
);

export type IncomeChangedSubscriptionVariables = Exact<{ [key: string]: never; }>;


export type IncomeChangedSubscription = (
  { __typename?: 'Subscription' }
  & { incomeChanged: (
    { __typename?: 'IncomeSubscription' }
    & Pick<IncomeSubscription, 'deleted' | 'overviewCost' | 'total' | 'weekly'>
    & { created?: Maybe<(
      { __typename?: 'IncomeCreatedSubscription' }
      & Pick<IncomeCreatedSubscription, 'fakeId'>
      & { item: (
        { __typename?: 'Income' }
        & IncomePartsFragment
      ) }
    )>, updated?: Maybe<(
      { __typename?: 'Income' }
      & IncomePartsFragment
    )> }
  ) }
);

export type ListChangedSubscriptionVariables = Exact<{ [key: string]: never; }>;


export type ListChangedSubscription = (
  { __typename?: 'Subscription' }
  & { listChanged: (
    { __typename?: 'ListSubscription' }
    & Pick<ListSubscription, 'page' | 'deleted' | 'overviewCost' | 'total' | 'weekly'>
    & { created?: Maybe<(
      { __typename?: 'ListItemStandardCreatedSubscription' }
      & Pick<ListItemStandardCreatedSubscription, 'fakeId'>
      & { item: (
        { __typename?: 'ListItemStandard' }
        & ListItemStandardPartsFragment
      ) }
    )>, updated?: Maybe<(
      { __typename?: 'ListItemStandard' }
      & ListItemStandardPartsFragment
    )> }
  ) }
);

export type ReceiptCreatedSubscriptionVariables = Exact<{ [key: string]: never; }>;


export type ReceiptCreatedSubscription = (
  { __typename?: 'Subscription' }
  & { receiptCreated: (
    { __typename?: 'ReceiptCreated' }
    & { items?: Maybe<Array<(
      { __typename?: 'ReceiptItem' }
      & Pick<ReceiptItem, 'page' | 'id' | 'date' | 'item' | 'cost' | 'category' | 'shop'>
    )>> }
  ) }
);

export type NetWorthCategoryCreatedSubscriptionVariables = Exact<{ [key: string]: never; }>;


export type NetWorthCategoryCreatedSubscription = (
  { __typename?: 'Subscription' }
  & { netWorthCategoryCreated: (
    { __typename?: 'NetWorthCategoryCreated' }
    & { item?: Maybe<(
      { __typename?: 'NetWorthCategory' }
      & Pick<NetWorthCategory, 'id'>
      & NetWorthCategoryPartsFragment
    )> }
  ) }
);

export type NetWorthCategoryUpdatedSubscriptionVariables = Exact<{ [key: string]: never; }>;


export type NetWorthCategoryUpdatedSubscription = (
  { __typename?: 'Subscription' }
  & { netWorthCategoryUpdated: (
    { __typename?: 'NetWorthCategoryUpdated' }
    & { item?: Maybe<(
      { __typename?: 'NetWorthCategory' }
      & Pick<NetWorthCategory, 'id'>
      & NetWorthCategoryPartsFragment
    )> }
  ) }
);

export type NetWorthCategoryDeletedSubscriptionVariables = Exact<{ [key: string]: never; }>;


export type NetWorthCategoryDeletedSubscription = (
  { __typename?: 'Subscription' }
  & { netWorthCategoryDeleted: (
    { __typename?: 'NetWorthDeleted' }
    & Pick<NetWorthDeleted, 'id'>
  ) }
);

export type NetWorthSubcategoryCreatedSubscriptionVariables = Exact<{ [key: string]: never; }>;


export type NetWorthSubcategoryCreatedSubscription = (
  { __typename?: 'Subscription' }
  & { netWorthSubcategoryCreated: (
    { __typename?: 'NetWorthSubcategoryCreated' }
    & { item?: Maybe<(
      { __typename?: 'NetWorthSubcategory' }
      & Pick<NetWorthSubcategory, 'id'>
      & NetWorthSubcategoryPartsFragment
    )> }
  ) }
);

export type NetWorthSubcategoryUpdatedSubscriptionVariables = Exact<{ [key: string]: never; }>;


export type NetWorthSubcategoryUpdatedSubscription = (
  { __typename?: 'Subscription' }
  & { netWorthSubcategoryUpdated: (
    { __typename?: 'NetWorthSubcategoryUpdated' }
    & { item?: Maybe<(
      { __typename?: 'NetWorthSubcategory' }
      & Pick<NetWorthSubcategory, 'id'>
      & NetWorthSubcategoryPartsFragment
    )> }
  ) }
);

export type NetWorthSubcategoryDeletedSubscriptionVariables = Exact<{ [key: string]: never; }>;


export type NetWorthSubcategoryDeletedSubscription = (
  { __typename?: 'Subscription' }
  & { netWorthSubcategoryDeleted: (
    { __typename?: 'NetWorthDeleted' }
    & Pick<NetWorthDeleted, 'id'>
  ) }
);

export type NetWorthEntryCreatedSubscriptionVariables = Exact<{ [key: string]: never; }>;


export type NetWorthEntryCreatedSubscription = (
  { __typename?: 'Subscription' }
  & { netWorthEntryCreated: (
    { __typename?: 'NetWorthEntryCreated' }
    & { item?: Maybe<(
      { __typename?: 'NetWorthEntry' }
      & Pick<NetWorthEntry, 'id'>
      & NetWorthEntryPartsFragment
    )> }
  ) }
);

export type NetWorthEntryUpdatedSubscriptionVariables = Exact<{ [key: string]: never; }>;


export type NetWorthEntryUpdatedSubscription = (
  { __typename?: 'Subscription' }
  & { netWorthEntryUpdated: (
    { __typename?: 'NetWorthEntryUpdated' }
    & { item?: Maybe<(
      { __typename?: 'NetWorthEntry' }
      & Pick<NetWorthEntry, 'id'>
      & NetWorthEntryPartsFragment
    )> }
  ) }
);

export type NetWorthEntryDeletedSubscriptionVariables = Exact<{ [key: string]: never; }>;


export type NetWorthEntryDeletedSubscription = (
  { __typename?: 'Subscription' }
  & { netWorthEntryDeleted: (
    { __typename?: 'NetWorthDeleted' }
    & Pick<NetWorthDeleted, 'id'>
  ) }
);

export type NetWorthCashTotalUpdatedSubscriptionVariables = Exact<{ [key: string]: never; }>;


export type NetWorthCashTotalUpdatedSubscription = (
  { __typename?: 'Subscription' }
  & { netWorthCashTotalUpdated: (
    { __typename?: 'NetWorthCashTotal' }
    & Pick<NetWorthCashTotal, 'cashInBank' | 'stockValue' | 'stocksIncludingCash' | 'date' | 'incomeSince' | 'spendingSince'>
  ) }
);

export const ConfigPartsFragmentDoc = gql`
    fragment ConfigParts on AppConfig {
  birthDate
  futureMonths
  realTimePrices
  fundMode
  fundPeriod
  fundLength
}
    `;
export const FundPartsFragmentDoc = gql`
    fragment FundParts on Fund {
  id
  item
  allocationTarget
  transactions {
    date
    units
    price
    fees
    taxes
    drip
    pension
  }
  stockSplits {
    date
    ratio
  }
}
    `;
export const FundHistoryPartsFragmentDoc = gql`
    fragment FundHistoryParts on FundHistory {
  startTime
  cacheTimes
  prices {
    fundId
    groups {
      startIndex
      values
    }
  }
  annualisedFundReturns
  overviewCost
}
    `;
export const ListItemStandardPartsFragmentDoc = gql`
    fragment ListItemStandardParts on ListItemStandard {
  id
  date
  item
  category
  cost
  shop
}
    `;
export const IncomePartsFragmentDoc = gql`
    fragment IncomeParts on Income {
  id
  date
  item
  category
  cost
  shop
  deductions {
    name
    value
  }
}
    `;
export const NetWorthCategoryPartsFragmentDoc = gql`
    fragment NetWorthCategoryParts on NetWorthCategory {
  type
  category
  isOption
  color
}
    `;
export const NetWorthSubcategoryPartsFragmentDoc = gql`
    fragment NetWorthSubcategoryParts on NetWorthSubcategory {
  categoryId
  subcategory
  hasCreditLimit
  appreciationRate
  isSAYE
  opacity
}
    `;
export const NetWorthEntryPartsFragmentDoc = gql`
    fragment NetWorthEntryParts on NetWorthEntry {
  date
  values {
    subcategory
    skip
    simple
    fx {
      value
      currency
    }
    option {
      units
      strikePrice
      marketPrice
      vested
    }
    loan {
      principal
      paymentsRemaining
      rate
      paid
    }
  }
  creditLimit {
    subcategory
    value
  }
  currencies {
    currency
    rate
  }
}
    `;
export const PlanningParametersPartsFragmentDoc = gql`
    fragment PlanningParametersParts on PlanningParameters {
  rates {
    name
    value
  }
  thresholds {
    name
    value
  }
}
    `;
export const PlanningAccountPartsFragmentDoc = gql`
    fragment PlanningAccountParts on PlanningAccount {
  id
  account
  netWorthSubcategoryId
  upperLimit
  lowerLimit
  income {
    id
    startDate
    endDate
    salary
    taxCode
    pensionContrib
    studentLoan
  }
  creditCards {
    id
    netWorthSubcategoryId
    payments {
      id
      month
      value
    }
    predictedPayment
  }
  values {
    id
    month
    transferToAccountId
    name
    value
    formula
  }
  computedValues {
    key
    month
    name
    value
    isVerified
    isTransfer
  }
  computedStartValue
}
    `;
export const SetConfigDocument = gql`
    mutation SetConfig($config: AppConfigInput!) {
  setConfig(config: $config) {
    config {
      ...ConfigParts
    }
  }
}
    ${ConfigPartsFragmentDoc}`;

export function useSetConfigMutation() {
  return Urql.useMutation<SetConfigMutation, SetConfigMutationVariables>(SetConfigDocument);
};
export const CreateFundDocument = gql`
    mutation CreateFund($fakeId: Int!, $input: FundInput!) {
  createFund(fakeId: $fakeId, input: $input) {
    error
    id
  }
}
    `;

export function useCreateFundMutation() {
  return Urql.useMutation<CreateFundMutation, CreateFundMutationVariables>(CreateFundDocument);
};
export const UpdateFundDocument = gql`
    mutation UpdateFund($id: Int!, $input: FundInput!) {
  updateFund(id: $id, input: $input) {
    error
  }
}
    `;

export function useUpdateFundMutation() {
  return Urql.useMutation<UpdateFundMutation, UpdateFundMutationVariables>(UpdateFundDocument);
};
export const DeleteFundDocument = gql`
    mutation DeleteFund($id: Int!) {
  deleteFund(id: $id) {
    error
  }
}
    `;

export function useDeleteFundMutation() {
  return Urql.useMutation<DeleteFundMutation, DeleteFundMutationVariables>(DeleteFundDocument);
};
export const UpdateCashAllocationTargetDocument = gql`
    mutation UpdateCashAllocationTarget($target: NonNegativeInt!) {
  updateCashAllocationTarget(target: $target) {
    error
  }
}
    `;

export function useUpdateCashAllocationTargetMutation() {
  return Urql.useMutation<UpdateCashAllocationTargetMutation, UpdateCashAllocationTargetMutationVariables>(UpdateCashAllocationTargetDocument);
};
export const UpdateFundAllocationTargetsDocument = gql`
    mutation UpdateFundAllocationTargets($deltas: [TargetDelta!]!) {
  updateFundAllocationTargets(deltas: $deltas) {
    error
    deltas {
      id
      allocationTarget
    }
  }
}
    `;

export function useUpdateFundAllocationTargetsMutation() {
  return Urql.useMutation<UpdateFundAllocationTargetsMutation, UpdateFundAllocationTargetsMutationVariables>(UpdateFundAllocationTargetsDocument);
};
export const CreateIncomeDocument = gql`
    mutation CreateIncome($fakeId: Int!, $input: IncomeInput!) {
  createIncome(fakeId: $fakeId, input: $input) {
    error
    id
  }
}
    `;

export function useCreateIncomeMutation() {
  return Urql.useMutation<CreateIncomeMutation, CreateIncomeMutationVariables>(CreateIncomeDocument);
};
export const UpdateIncomeDocument = gql`
    mutation UpdateIncome($id: Int!, $input: IncomeInput!) {
  updateIncome(id: $id, input: $input) {
    error
  }
}
    `;

export function useUpdateIncomeMutation() {
  return Urql.useMutation<UpdateIncomeMutation, UpdateIncomeMutationVariables>(UpdateIncomeDocument);
};
export const DeleteIncomeDocument = gql`
    mutation DeleteIncome($id: Int!) {
  deleteIncome(id: $id) {
    error
  }
}
    `;

export function useDeleteIncomeMutation() {
  return Urql.useMutation<DeleteIncomeMutation, DeleteIncomeMutationVariables>(DeleteIncomeDocument);
};
export const CreateListItemDocument = gql`
    mutation CreateListItem($page: PageListStandard!, $fakeId: Int!, $input: ListItemStandardInput!) {
  createListItem(page: $page, fakeId: $fakeId, input: $input) {
    error
    id
  }
}
    `;

export function useCreateListItemMutation() {
  return Urql.useMutation<CreateListItemMutation, CreateListItemMutationVariables>(CreateListItemDocument);
};
export const UpdateListItemDocument = gql`
    mutation UpdateListItem($page: PageListStandard!, $id: Int!, $input: ListItemStandardInput!) {
  updateListItem(page: $page, id: $id, input: $input) {
    error
  }
}
    `;

export function useUpdateListItemMutation() {
  return Urql.useMutation<UpdateListItemMutation, UpdateListItemMutationVariables>(UpdateListItemDocument);
};
export const DeleteListItemDocument = gql`
    mutation DeleteListItem($page: PageListStandard!, $id: Int!) {
  deleteListItem(page: $page, id: $id) {
    error
  }
}
    `;

export function useDeleteListItemMutation() {
  return Urql.useMutation<DeleteListItemMutation, DeleteListItemMutationVariables>(DeleteListItemDocument);
};
export const CreateReceiptDocument = gql`
    mutation CreateReceipt($date: Date!, $shop: String!, $items: [ReceiptInput!]!) {
  createReceipt(date: $date, shop: $shop, items: $items) {
    error
  }
}
    `;

export function useCreateReceiptMutation() {
  return Urql.useMutation<CreateReceiptMutation, CreateReceiptMutationVariables>(CreateReceiptDocument);
};
export const LoginDocument = gql`
    mutation Login($pin: Int!) {
  login(pin: $pin) {
    error
    uid
    name
    apiKey
    expires
  }
}
    `;

export function useLoginMutation() {
  return Urql.useMutation<LoginMutation, LoginMutationVariables>(LoginDocument);
};
export const LogoutDocument = gql`
    mutation Logout {
  logout {
    error
    ok
  }
}
    `;

export function useLogoutMutation() {
  return Urql.useMutation<LogoutMutation, LogoutMutationVariables>(LogoutDocument);
};
export const CreateNetWorthCategoryDocument = gql`
    mutation CreateNetWorthCategory($input: NetWorthCategoryInput!) {
  createNetWorthCategory(input: $input) {
    id
    error
  }
}
    `;

export function useCreateNetWorthCategoryMutation() {
  return Urql.useMutation<CreateNetWorthCategoryMutation, CreateNetWorthCategoryMutationVariables>(CreateNetWorthCategoryDocument);
};
export const UpdateNetWorthCategoryDocument = gql`
    mutation UpdateNetWorthCategory($id: Int!, $input: NetWorthCategoryInput!) {
  updateNetWorthCategory(id: $id, input: $input) {
    error
  }
}
    `;

export function useUpdateNetWorthCategoryMutation() {
  return Urql.useMutation<UpdateNetWorthCategoryMutation, UpdateNetWorthCategoryMutationVariables>(UpdateNetWorthCategoryDocument);
};
export const DeleteNetWorthCategoryDocument = gql`
    mutation DeleteNetWorthCategory($id: Int!) {
  deleteNetWorthCategory(id: $id) {
    error
  }
}
    `;

export function useDeleteNetWorthCategoryMutation() {
  return Urql.useMutation<DeleteNetWorthCategoryMutation, DeleteNetWorthCategoryMutationVariables>(DeleteNetWorthCategoryDocument);
};
export const CreateNetWorthSubcategoryDocument = gql`
    mutation CreateNetWorthSubcategory($input: NetWorthSubcategoryInput!) {
  createNetWorthSubcategory(input: $input) {
    id
    error
  }
}
    `;

export function useCreateNetWorthSubcategoryMutation() {
  return Urql.useMutation<CreateNetWorthSubcategoryMutation, CreateNetWorthSubcategoryMutationVariables>(CreateNetWorthSubcategoryDocument);
};
export const UpdateNetWorthSubcategoryDocument = gql`
    mutation UpdateNetWorthSubcategory($id: Int!, $input: NetWorthSubcategoryInput!) {
  updateNetWorthSubcategory(id: $id, input: $input) {
    error
  }
}
    `;

export function useUpdateNetWorthSubcategoryMutation() {
  return Urql.useMutation<UpdateNetWorthSubcategoryMutation, UpdateNetWorthSubcategoryMutationVariables>(UpdateNetWorthSubcategoryDocument);
};
export const DeleteNetWorthSubcategoryDocument = gql`
    mutation DeleteNetWorthSubcategory($id: Int!) {
  deleteNetWorthSubcategory(id: $id) {
    error
  }
}
    `;

export function useDeleteNetWorthSubcategoryMutation() {
  return Urql.useMutation<DeleteNetWorthSubcategoryMutation, DeleteNetWorthSubcategoryMutationVariables>(DeleteNetWorthSubcategoryDocument);
};
export const CreateNetWorthEntryDocument = gql`
    mutation CreateNetWorthEntry($input: NetWorthEntryInput!) {
  createNetWorthEntry(input: $input) {
    id
    error
  }
}
    `;

export function useCreateNetWorthEntryMutation() {
  return Urql.useMutation<CreateNetWorthEntryMutation, CreateNetWorthEntryMutationVariables>(CreateNetWorthEntryDocument);
};
export const UpdateNetWorthEntryDocument = gql`
    mutation UpdateNetWorthEntry($id: Int!, $input: NetWorthEntryInput!) {
  updateNetWorthEntry(id: $id, input: $input) {
    error
  }
}
    `;

export function useUpdateNetWorthEntryMutation() {
  return Urql.useMutation<UpdateNetWorthEntryMutation, UpdateNetWorthEntryMutationVariables>(UpdateNetWorthEntryDocument);
};
export const DeleteNetWorthEntryDocument = gql`
    mutation DeleteNetWorthEntry($id: Int!) {
  deleteNetWorthEntry(id: $id) {
    error
  }
}
    `;

export function useDeleteNetWorthEntryMutation() {
  return Urql.useMutation<DeleteNetWorthEntryMutation, DeleteNetWorthEntryMutationVariables>(DeleteNetWorthEntryDocument);
};
export const SyncPlanningDocument = gql`
    mutation SyncPlanning($year: NonNegativeInt!, $input: PlanningSync) {
  syncPlanning(year: $year, input: $input) {
    error
    year
    parameters {
      ...PlanningParametersParts
    }
    accounts {
      ...PlanningAccountParts
    }
    taxReliefFromPreviousYear
  }
}
    ${PlanningParametersPartsFragmentDoc}
${PlanningAccountPartsFragmentDoc}`;

export function useSyncPlanningMutation() {
  return Urql.useMutation<SyncPlanningMutation, SyncPlanningMutationVariables>(SyncPlanningDocument);
};
export const AnalysisDocument = gql`
    query Analysis($period: AnalysisPeriod!, $groupBy: AnalysisGroupBy!, $page: Int) {
  analysis(period: $period, groupBy: $groupBy, page: $page) {
    description
    startDate
    endDate
    cost {
      item
      tree {
        category
        sum
      }
    }
  }
}
    `;

export function useAnalysisQuery(options: Omit<Urql.UseQueryArgs<AnalysisQueryVariables>, 'query'> = {}) {
  return Urql.useQuery<AnalysisQuery>({ query: AnalysisDocument, ...options });
};
export const AnalysisDeepDocument = gql`
    query AnalysisDeep($category: AnalysisPage!, $period: AnalysisPeriod!, $groupBy: AnalysisGroupBy!, $page: Int) {
  analysisDeep(
    category: $category
    period: $period
    groupBy: $groupBy
    page: $page
  ) {
    item
    tree {
      category
      sum
    }
  }
}
    `;

export function useAnalysisDeepQuery(options: Omit<Urql.UseQueryArgs<AnalysisDeepQueryVariables>, 'query'> = {}) {
  return Urql.useQuery<AnalysisDeepQuery>({ query: AnalysisDeepDocument, ...options });
};
export const ExchangeRatesDocument = gql`
    query ExchangeRates($base: String!) {
  exchangeRates(base: $base) {
    error
    rates {
      currency
      rate
    }
  }
}
    `;

export function useExchangeRatesQuery(options: Omit<Urql.UseQueryArgs<ExchangeRatesQueryVariables>, 'query'> = {}) {
  return Urql.useQuery<ExchangeRatesQuery>({ query: ExchangeRatesDocument, ...options });
};
export const FundPricesUpdateDocument = gql`
    query FundPricesUpdate($period: FundPeriod, $length: NonNegativeInt) {
  fundHistory(period: $period, length: $length) {
    ...FundHistoryParts
  }
}
    ${FundHistoryPartsFragmentDoc}`;

export function useFundPricesUpdateQuery(options: Omit<Urql.UseQueryArgs<FundPricesUpdateQueryVariables>, 'query'> = {}) {
  return Urql.useQuery<FundPricesUpdateQuery>({ query: FundPricesUpdateDocument, ...options });
};
export const StockPricesDocument = gql`
    query StockPrices($codes: [String!]!) {
  stockPrices(codes: $codes) {
    prices {
      code
      price
    }
    refreshTime
  }
}
    `;

export function useStockPricesQuery(options: Omit<Urql.UseQueryArgs<StockPricesQueryVariables>, 'query'> = {}) {
  return Urql.useQuery<StockPricesQuery>({ query: StockPricesDocument, ...options });
};
export const FundHistoryIndividualDocument = gql`
    query FundHistoryIndividual($id: NonNegativeInt!) {
  fundHistoryIndividual(id: $id) {
    values {
      date
      price
    }
  }
}
    `;

export function useFundHistoryIndividualQuery(options: Omit<Urql.UseQueryArgs<FundHistoryIndividualQueryVariables>, 'query'> = {}) {
  return Urql.useQuery<FundHistoryIndividualQuery>({ query: FundHistoryIndividualDocument, ...options });
};
export const InitialDocument = gql`
    query Initial($fundPeriod: FundPeriod, $fundLength: NonNegativeInt) {
  config {
    ...ConfigParts
  }
  overview {
    startDate
    endDate
    monthly {
      investmentPurchases
      income
      bills
      food
      general
      holiday
      social
    }
    initialCumulativeValues {
      income
      spending
    }
  }
  netWorthCategories: readNetWorthCategories {
    id
    ...NetWorthCategoryParts
  }
  netWorthSubcategories: readNetWorthSubcategories {
    id
    ...NetWorthSubcategoryParts
  }
  netWorthEntries: readNetWorthEntries {
    current {
      id
      ...NetWorthEntryParts
    }
  }
  netWorthCashTotal {
    cashInBank
    stockValue
    stocksIncludingCash
    date
    incomeSince
    spendingSince
  }
  cashAllocationTarget
  funds: readFunds {
    items {
      ...FundParts
    }
  }
  fundHistory(period: $fundPeriod, length: $fundLength) {
    ...FundHistoryParts
  }
}
    ${ConfigPartsFragmentDoc}
${NetWorthCategoryPartsFragmentDoc}
${NetWorthSubcategoryPartsFragmentDoc}
${NetWorthEntryPartsFragmentDoc}
${FundPartsFragmentDoc}
${FundHistoryPartsFragmentDoc}`;

export function useInitialQuery(options: Omit<Urql.UseQueryArgs<InitialQueryVariables>, 'query'> = {}) {
  return Urql.useQuery<InitialQuery>({ query: InitialDocument, ...options });
};
export const MoreListDataStandardDocument = gql`
    query MoreListDataStandard($page: PageListStandard!, $offset: Int!, $limit: Int!) {
  readListStandard: readList(page: $page, offset: $offset, limit: $limit) {
    items {
      id
      date
      item
      cost
      category
      shop
    }
    total
    weekly
    olderExists
  }
}
    `;

export function useMoreListDataStandardQuery(options: Omit<Urql.UseQueryArgs<MoreListDataStandardQueryVariables>, 'query'> = {}) {
  return Urql.useQuery<MoreListDataStandardQuery>({ query: MoreListDataStandardDocument, ...options });
};
export const MoreIncomeDataDocument = gql`
    query MoreIncomeData($offset: Int!, $limit: Int!) {
  readIncome(offset: $offset, limit: $limit) {
    items {
      id
      date
      item
      cost
      category
      shop
      deductions {
        name
        value
      }
    }
    total
    weekly
    olderExists
  }
}
    `;

export function useMoreIncomeDataQuery(options: Omit<Urql.UseQueryArgs<MoreIncomeDataQueryVariables>, 'query'> = {}) {
  return Urql.useQuery<MoreIncomeDataQuery>({ query: MoreIncomeDataDocument, ...options });
};
export const NetWorthLoansDocument = gql`
    query NetWorthLoans {
  netWorthLoans {
    loans {
      subcategory
      values {
        date
        value {
          principal
          rate
          paymentsRemaining
          paid
        }
      }
    }
  }
}
    `;

export function useNetWorthLoansQuery(options: Omit<Urql.UseQueryArgs<NetWorthLoansQueryVariables>, 'query'> = {}) {
  return Urql.useQuery<NetWorthLoansQuery>({ query: NetWorthLoansDocument, ...options });
};
export const OverviewOldDocument = gql`
    query OverviewOld($now: Date) {
  overviewOld(now: $now) {
    startDate
    stocks
    investmentPurchases
    pension
    cashLiquid
    cashOther
    investments
    illiquidEquity
    assets
    liabilities
    options
    netWorth
    income
    spending
  }
}
    `;

export function useOverviewOldQuery(options: Omit<Urql.UseQueryArgs<OverviewOldQueryVariables>, 'query'> = {}) {
  return Urql.useQuery<OverviewOldQuery>({ query: OverviewOldDocument, ...options });
};
export const OverviewPreviewDocument = gql`
    query OverviewPreview($category: MonthlyCategory!, $date: Date!) {
  overviewPreview(category: $category, date: $date) {
    startDate
    values
  }
}
    `;

export function useOverviewPreviewQuery(options: Omit<Urql.UseQueryArgs<OverviewPreviewQueryVariables>, 'query'> = {}) {
  return Urql.useQuery<OverviewPreviewQuery>({ query: OverviewPreviewDocument, ...options });
};
export const SearchSuggestionsDocument = gql`
    query SearchSuggestions($page: SearchPage!, $column: SearchItem!, $searchTerm: String!, $numResults: Int) {
  search(
    page: $page
    column: $column
    searchTerm: $searchTerm
    numResults: $numResults
  ) {
    error
    searchTerm
    list
    nextCategory
    nextField
  }
}
    `;

export function useSearchSuggestionsQuery(options: Omit<Urql.UseQueryArgs<SearchSuggestionsQueryVariables>, 'query'> = {}) {
  return Urql.useQuery<SearchSuggestionsQuery>({ query: SearchSuggestionsDocument, ...options });
};
export const ReceiptItemDocument = gql`
    query ReceiptItem($item: String!) {
  receiptItem(item: $item)
}
    `;

export function useReceiptItemQuery(options: Omit<Urql.UseQueryArgs<ReceiptItemQueryVariables>, 'query'> = {}) {
  return Urql.useQuery<ReceiptItemQuery>({ query: ReceiptItemDocument, ...options });
};
export const ReceiptItemsDocument = gql`
    query ReceiptItems($items: [String!]!) {
  receiptItems(items: $items) {
    page
    item
    category
  }
}
    `;

export function useReceiptItemsQuery(options: Omit<Urql.UseQueryArgs<ReceiptItemsQueryVariables>, 'query'> = {}) {
  return Urql.useQuery<ReceiptItemsQuery>({ query: ReceiptItemsDocument, ...options });
};
export const ConfigUpdatedDocument = gql`
    subscription ConfigUpdated {
  configUpdated {
    ...ConfigParts
  }
}
    ${ConfigPartsFragmentDoc}`;

export function useConfigUpdatedSubscription<TData = ConfigUpdatedSubscription>(options: Omit<Urql.UseSubscriptionArgs<ConfigUpdatedSubscriptionVariables>, 'query'> = {}, handler?: Urql.SubscriptionHandler<ConfigUpdatedSubscription, TData>) {
  return Urql.useSubscription<ConfigUpdatedSubscription, TData, ConfigUpdatedSubscriptionVariables>({ query: ConfigUpdatedDocument, ...options }, handler);
};
export const FundsChangedDocument = gql`
    subscription FundsChanged {
  fundsChanged {
    created {
      fakeId
      item {
        ...FundParts
      }
    }
    updated {
      ...FundParts
    }
    deleted
    overviewCost
  }
}
    ${FundPartsFragmentDoc}`;

export function useFundsChangedSubscription<TData = FundsChangedSubscription>(options: Omit<Urql.UseSubscriptionArgs<FundsChangedSubscriptionVariables>, 'query'> = {}, handler?: Urql.SubscriptionHandler<FundsChangedSubscription, TData>) {
  return Urql.useSubscription<FundsChangedSubscription, TData, FundsChangedSubscriptionVariables>({ query: FundsChangedDocument, ...options }, handler);
};
export const FundPricesUpdatedDocument = gql`
    subscription FundPricesUpdated($period: FundPeriod, $length: NonNegativeInt) {
  fundPricesUpdated(period: $period, length: $length) {
    ...FundHistoryParts
  }
}
    ${FundHistoryPartsFragmentDoc}`;

export function useFundPricesUpdatedSubscription<TData = FundPricesUpdatedSubscription>(options: Omit<Urql.UseSubscriptionArgs<FundPricesUpdatedSubscriptionVariables>, 'query'> = {}, handler?: Urql.SubscriptionHandler<FundPricesUpdatedSubscription, TData>) {
  return Urql.useSubscription<FundPricesUpdatedSubscription, TData, FundPricesUpdatedSubscriptionVariables>({ query: FundPricesUpdatedDocument, ...options }, handler);
};
export const CashAllocationTargetUpdatedDocument = gql`
    subscription CashAllocationTargetUpdated {
  cashAllocationTargetUpdated
}
    `;

export function useCashAllocationTargetUpdatedSubscription<TData = CashAllocationTargetUpdatedSubscription>(options: Omit<Urql.UseSubscriptionArgs<CashAllocationTargetUpdatedSubscriptionVariables>, 'query'> = {}, handler?: Urql.SubscriptionHandler<CashAllocationTargetUpdatedSubscription, TData>) {
  return Urql.useSubscription<CashAllocationTargetUpdatedSubscription, TData, CashAllocationTargetUpdatedSubscriptionVariables>({ query: CashAllocationTargetUpdatedDocument, ...options }, handler);
};
export const FundAllocationTargetsUpdatedDocument = gql`
    subscription FundAllocationTargetsUpdated {
  fundAllocationTargetsUpdated {
    deltas {
      id
      allocationTarget
    }
  }
}
    `;

export function useFundAllocationTargetsUpdatedSubscription<TData = FundAllocationTargetsUpdatedSubscription>(options: Omit<Urql.UseSubscriptionArgs<FundAllocationTargetsUpdatedSubscriptionVariables>, 'query'> = {}, handler?: Urql.SubscriptionHandler<FundAllocationTargetsUpdatedSubscription, TData>) {
  return Urql.useSubscription<FundAllocationTargetsUpdatedSubscription, TData, FundAllocationTargetsUpdatedSubscriptionVariables>({ query: FundAllocationTargetsUpdatedDocument, ...options }, handler);
};
export const IncomeChangedDocument = gql`
    subscription IncomeChanged {
  incomeChanged {
    created {
      fakeId
      item {
        ...IncomeParts
      }
    }
    updated {
      ...IncomeParts
    }
    deleted
    overviewCost
    total
    weekly
  }
}
    ${IncomePartsFragmentDoc}`;

export function useIncomeChangedSubscription<TData = IncomeChangedSubscription>(options: Omit<Urql.UseSubscriptionArgs<IncomeChangedSubscriptionVariables>, 'query'> = {}, handler?: Urql.SubscriptionHandler<IncomeChangedSubscription, TData>) {
  return Urql.useSubscription<IncomeChangedSubscription, TData, IncomeChangedSubscriptionVariables>({ query: IncomeChangedDocument, ...options }, handler);
};
export const ListChangedDocument = gql`
    subscription ListChanged {
  listChanged(pages: [bills, food, general, holiday, social]) {
    page
    created {
      fakeId
      item {
        ...ListItemStandardParts
      }
    }
    updated {
      ...ListItemStandardParts
    }
    deleted
    overviewCost
    total
    weekly
  }
}
    ${ListItemStandardPartsFragmentDoc}`;

export function useListChangedSubscription<TData = ListChangedSubscription>(options: Omit<Urql.UseSubscriptionArgs<ListChangedSubscriptionVariables>, 'query'> = {}, handler?: Urql.SubscriptionHandler<ListChangedSubscription, TData>) {
  return Urql.useSubscription<ListChangedSubscription, TData, ListChangedSubscriptionVariables>({ query: ListChangedDocument, ...options }, handler);
};
export const ReceiptCreatedDocument = gql`
    subscription ReceiptCreated {
  receiptCreated {
    items {
      page
      id
      date
      item
      cost
      category
      shop
    }
  }
}
    `;

export function useReceiptCreatedSubscription<TData = ReceiptCreatedSubscription>(options: Omit<Urql.UseSubscriptionArgs<ReceiptCreatedSubscriptionVariables>, 'query'> = {}, handler?: Urql.SubscriptionHandler<ReceiptCreatedSubscription, TData>) {
  return Urql.useSubscription<ReceiptCreatedSubscription, TData, ReceiptCreatedSubscriptionVariables>({ query: ReceiptCreatedDocument, ...options }, handler);
};
export const NetWorthCategoryCreatedDocument = gql`
    subscription NetWorthCategoryCreated {
  netWorthCategoryCreated {
    item {
      id
      ...NetWorthCategoryParts
    }
  }
}
    ${NetWorthCategoryPartsFragmentDoc}`;

export function useNetWorthCategoryCreatedSubscription<TData = NetWorthCategoryCreatedSubscription>(options: Omit<Urql.UseSubscriptionArgs<NetWorthCategoryCreatedSubscriptionVariables>, 'query'> = {}, handler?: Urql.SubscriptionHandler<NetWorthCategoryCreatedSubscription, TData>) {
  return Urql.useSubscription<NetWorthCategoryCreatedSubscription, TData, NetWorthCategoryCreatedSubscriptionVariables>({ query: NetWorthCategoryCreatedDocument, ...options }, handler);
};
export const NetWorthCategoryUpdatedDocument = gql`
    subscription NetWorthCategoryUpdated {
  netWorthCategoryUpdated {
    item {
      id
      ...NetWorthCategoryParts
    }
  }
}
    ${NetWorthCategoryPartsFragmentDoc}`;

export function useNetWorthCategoryUpdatedSubscription<TData = NetWorthCategoryUpdatedSubscription>(options: Omit<Urql.UseSubscriptionArgs<NetWorthCategoryUpdatedSubscriptionVariables>, 'query'> = {}, handler?: Urql.SubscriptionHandler<NetWorthCategoryUpdatedSubscription, TData>) {
  return Urql.useSubscription<NetWorthCategoryUpdatedSubscription, TData, NetWorthCategoryUpdatedSubscriptionVariables>({ query: NetWorthCategoryUpdatedDocument, ...options }, handler);
};
export const NetWorthCategoryDeletedDocument = gql`
    subscription NetWorthCategoryDeleted {
  netWorthCategoryDeleted {
    id
  }
}
    `;

export function useNetWorthCategoryDeletedSubscription<TData = NetWorthCategoryDeletedSubscription>(options: Omit<Urql.UseSubscriptionArgs<NetWorthCategoryDeletedSubscriptionVariables>, 'query'> = {}, handler?: Urql.SubscriptionHandler<NetWorthCategoryDeletedSubscription, TData>) {
  return Urql.useSubscription<NetWorthCategoryDeletedSubscription, TData, NetWorthCategoryDeletedSubscriptionVariables>({ query: NetWorthCategoryDeletedDocument, ...options }, handler);
};
export const NetWorthSubcategoryCreatedDocument = gql`
    subscription NetWorthSubcategoryCreated {
  netWorthSubcategoryCreated {
    item {
      id
      ...NetWorthSubcategoryParts
    }
  }
}
    ${NetWorthSubcategoryPartsFragmentDoc}`;

export function useNetWorthSubcategoryCreatedSubscription<TData = NetWorthSubcategoryCreatedSubscription>(options: Omit<Urql.UseSubscriptionArgs<NetWorthSubcategoryCreatedSubscriptionVariables>, 'query'> = {}, handler?: Urql.SubscriptionHandler<NetWorthSubcategoryCreatedSubscription, TData>) {
  return Urql.useSubscription<NetWorthSubcategoryCreatedSubscription, TData, NetWorthSubcategoryCreatedSubscriptionVariables>({ query: NetWorthSubcategoryCreatedDocument, ...options }, handler);
};
export const NetWorthSubcategoryUpdatedDocument = gql`
    subscription NetWorthSubcategoryUpdated {
  netWorthSubcategoryUpdated {
    item {
      id
      ...NetWorthSubcategoryParts
    }
  }
}
    ${NetWorthSubcategoryPartsFragmentDoc}`;

export function useNetWorthSubcategoryUpdatedSubscription<TData = NetWorthSubcategoryUpdatedSubscription>(options: Omit<Urql.UseSubscriptionArgs<NetWorthSubcategoryUpdatedSubscriptionVariables>, 'query'> = {}, handler?: Urql.SubscriptionHandler<NetWorthSubcategoryUpdatedSubscription, TData>) {
  return Urql.useSubscription<NetWorthSubcategoryUpdatedSubscription, TData, NetWorthSubcategoryUpdatedSubscriptionVariables>({ query: NetWorthSubcategoryUpdatedDocument, ...options }, handler);
};
export const NetWorthSubcategoryDeletedDocument = gql`
    subscription NetWorthSubcategoryDeleted {
  netWorthSubcategoryDeleted {
    id
  }
}
    `;

export function useNetWorthSubcategoryDeletedSubscription<TData = NetWorthSubcategoryDeletedSubscription>(options: Omit<Urql.UseSubscriptionArgs<NetWorthSubcategoryDeletedSubscriptionVariables>, 'query'> = {}, handler?: Urql.SubscriptionHandler<NetWorthSubcategoryDeletedSubscription, TData>) {
  return Urql.useSubscription<NetWorthSubcategoryDeletedSubscription, TData, NetWorthSubcategoryDeletedSubscriptionVariables>({ query: NetWorthSubcategoryDeletedDocument, ...options }, handler);
};
export const NetWorthEntryCreatedDocument = gql`
    subscription NetWorthEntryCreated {
  netWorthEntryCreated {
    item {
      id
      ...NetWorthEntryParts
    }
  }
}
    ${NetWorthEntryPartsFragmentDoc}`;

export function useNetWorthEntryCreatedSubscription<TData = NetWorthEntryCreatedSubscription>(options: Omit<Urql.UseSubscriptionArgs<NetWorthEntryCreatedSubscriptionVariables>, 'query'> = {}, handler?: Urql.SubscriptionHandler<NetWorthEntryCreatedSubscription, TData>) {
  return Urql.useSubscription<NetWorthEntryCreatedSubscription, TData, NetWorthEntryCreatedSubscriptionVariables>({ query: NetWorthEntryCreatedDocument, ...options }, handler);
};
export const NetWorthEntryUpdatedDocument = gql`
    subscription NetWorthEntryUpdated {
  netWorthEntryUpdated {
    item {
      id
      ...NetWorthEntryParts
    }
  }
}
    ${NetWorthEntryPartsFragmentDoc}`;

export function useNetWorthEntryUpdatedSubscription<TData = NetWorthEntryUpdatedSubscription>(options: Omit<Urql.UseSubscriptionArgs<NetWorthEntryUpdatedSubscriptionVariables>, 'query'> = {}, handler?: Urql.SubscriptionHandler<NetWorthEntryUpdatedSubscription, TData>) {
  return Urql.useSubscription<NetWorthEntryUpdatedSubscription, TData, NetWorthEntryUpdatedSubscriptionVariables>({ query: NetWorthEntryUpdatedDocument, ...options }, handler);
};
export const NetWorthEntryDeletedDocument = gql`
    subscription NetWorthEntryDeleted {
  netWorthEntryDeleted {
    id
  }
}
    `;

export function useNetWorthEntryDeletedSubscription<TData = NetWorthEntryDeletedSubscription>(options: Omit<Urql.UseSubscriptionArgs<NetWorthEntryDeletedSubscriptionVariables>, 'query'> = {}, handler?: Urql.SubscriptionHandler<NetWorthEntryDeletedSubscription, TData>) {
  return Urql.useSubscription<NetWorthEntryDeletedSubscription, TData, NetWorthEntryDeletedSubscriptionVariables>({ query: NetWorthEntryDeletedDocument, ...options }, handler);
};
export const NetWorthCashTotalUpdatedDocument = gql`
    subscription NetWorthCashTotalUpdated {
  netWorthCashTotalUpdated {
    cashInBank
    stockValue
    stocksIncludingCash
    date
    incomeSince
    spendingSince
  }
}
    `;

export function useNetWorthCashTotalUpdatedSubscription<TData = NetWorthCashTotalUpdatedSubscription>(options: Omit<Urql.UseSubscriptionArgs<NetWorthCashTotalUpdatedSubscriptionVariables>, 'query'> = {}, handler?: Urql.SubscriptionHandler<NetWorthCashTotalUpdatedSubscription, TData>) {
  return Urql.useSubscription<NetWorthCashTotalUpdatedSubscription, TData, NetWorthCashTotalUpdatedSubscriptionVariables>({ query: NetWorthCashTotalUpdatedDocument, ...options }, handler);
};