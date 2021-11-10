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
  __typename?: 'AnalysisResponse';
  cost: Array<CategoryCostTree>;
  description: Scalars['String'];
  endDate: Scalars['Date'];
  startDate: Scalars['Date'];
};

export type AppConfig = {
  __typename?: 'AppConfig';
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
  currency: Scalars['String'];
  value: Scalars['Float'];
};

export type FxValueInput = {
  currency: Scalars['String'];
  value: Scalars['Float'];
};

export type Fund = {
  __typename?: 'Fund';
  allocationTarget?: Maybe<Scalars['NonNegativeInt']>;
  id: Scalars['Int'];
  item: Scalars['String'];
  stockSplits: Array<StockSplit>;
  transactions: Array<Transaction>;
};

export type FundCreatedSubscription = {
  __typename?: 'FundCreatedSubscription';
  fakeId: Scalars['Int'];
  item: Fund;
};

export type FundHistory = {
  __typename?: 'FundHistory';
  annualisedFundReturns: Scalars['Float'];
  cacheTimes: Array<Scalars['Int']>;
  overviewCost: Array<Scalars['Int']>;
  prices: Array<FundPrices>;
  startTime: Scalars['Int'];
};

export type FundHistoryIndividual = {
  __typename?: 'FundHistoryIndividual';
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
  deleted?: Maybe<Scalars['NonNegativeInt']>;
  overviewCost: Array<Scalars['Int']>;
  updated?: Maybe<Fund>;
};

export type FundValueIndividual = {
  __typename?: 'FundValueIndividual';
  date: Scalars['Int'];
  price: Scalars['NonNegativeFloat'];
};

export type Income = {
  __typename?: 'Income';
  category: Scalars['String'];
  cost: Scalars['Int'];
  date: Scalars['Date'];
  deductions: Array<IncomeDeduction>;
  id: Scalars['Int'];
  item: Scalars['String'];
  shop: Scalars['String'];
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
  category: Scalars['String'];
  cost: Scalars['Int'];
  date: Scalars['String'];
  deductions: Array<IncomeDeductionInput>;
  item: Scalars['String'];
  shop: Scalars['String'];
};

export type IncomeReadResponse = {
  __typename?: 'IncomeReadResponse';
  error?: Maybe<Scalars['String']>;
  items: Array<Income>;
  olderExists?: Maybe<Scalars['Boolean']>;
  total?: Maybe<Scalars['Int']>;
  totalDeductions?: Maybe<Array<IncomeDeduction>>;
  weekly?: Maybe<Scalars['Int']>;
};

export type IncomeSubscription = {
  __typename?: 'IncomeSubscription';
  created?: Maybe<IncomeCreatedSubscription>;
  deleted?: Maybe<Scalars['NonNegativeInt']>;
  overviewCost: Array<Scalars['Int']>;
  total?: Maybe<Scalars['Int']>;
  totalDeductions?: Maybe<Array<IncomeDeduction>>;
  updated?: Maybe<Income>;
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
  category: Scalars['String'];
  cost: Scalars['Int'];
  date: Scalars['Date'];
  id: Scalars['Int'];
  item: Scalars['String'];
  shop: Scalars['String'];
};

export type ListItemStandardCreatedSubscription = {
  __typename?: 'ListItemStandardCreatedSubscription';
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
  __typename?: 'ListReadResponse';
  error?: Maybe<Scalars['String']>;
  items: Array<ListItemStandard>;
  olderExists?: Maybe<Scalars['Boolean']>;
  total?: Maybe<Scalars['Int']>;
  weekly?: Maybe<Scalars['Int']>;
};

export type ListSubscription = {
  __typename?: 'ListSubscription';
  created?: Maybe<ListItemStandardCreatedSubscription>;
  deleted?: Maybe<Scalars['NonNegativeInt']>;
  overviewCost: Array<Scalars['Int']>;
  page: PageListStandard;
  total?: Maybe<Scalars['Int']>;
  updated?: Maybe<ListItemStandard>;
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
  __typename?: 'LoginResponse';
  apiKey?: Maybe<Scalars['String']>;
  error?: Maybe<Scalars['String']>;
  expires?: Maybe<Scalars['DateTime']>;
  name?: Maybe<Scalars['String']>;
  uid?: Maybe<Scalars['Int']>;
};

export type LogoutResponse = {
  __typename?: 'LogoutResponse';
  error?: Maybe<Scalars['String']>;
  ok?: Maybe<Scalars['Boolean']>;
};

export type Monthly = {
  __typename?: 'Monthly';
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
  __typename?: 'NetWorthCashTotal';
  cashInBank: Scalars['Int'];
  date?: Maybe<Scalars['Date']>;
  incomeSince: Scalars['Int'];
  nonPensionStockValue: Scalars['Int'];
  pensionStockValue: Scalars['Int'];
  spendingSince: Scalars['Int'];
  stocksIncludingCash: Scalars['Int'];
};

export type NetWorthCategory = {
  __typename?: 'NetWorthCategory';
  category: Scalars['String'];
  color: Scalars['String'];
  id: Scalars['Int'];
  isOption?: Maybe<Scalars['Boolean']>;
  type: NetWorthCategoryType;
};

export type NetWorthCategoryCreated = {
  __typename?: 'NetWorthCategoryCreated';
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
  creditLimit: Array<CreditLimit>;
  currencies: Array<Currency>;
  date: Scalars['Date'];
  id: Scalars['Int'];
  values: Array<NetWorthValueObject>;
};

export type NetWorthEntryCreated = {
  __typename?: 'NetWorthEntryCreated';
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
  appreciationRate?: Maybe<Scalars['Float']>;
  categoryId: Scalars['Int'];
  hasCreditLimit?: Maybe<Scalars['Boolean']>;
  id: Scalars['Int'];
  isSAYE?: Maybe<Scalars['Boolean']>;
  opacity?: Maybe<Scalars['Float']>;
  subcategory: Scalars['String'];
};

export type NetWorthSubcategoryCreated = {
  __typename?: 'NetWorthSubcategoryCreated';
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
  __typename?: 'NetWorthSubcategoryUpdated';
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
  __typename?: 'NetWorthValueObject';
  fx?: Maybe<Array<FxValue>>;
  loan?: Maybe<LoanValue>;
  option?: Maybe<OptionValue>;
  simple?: Maybe<Scalars['Int']>;
  skip?: Maybe<Scalars['Boolean']>;
  subcategory: Scalars['Int'];
  value: Scalars['Int'];
};



export type OptionValue = {
  __typename?: 'OptionValue';
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
  __typename?: 'Overview';
  endDate: Scalars['Date'];
  futureIncome: Array<Scalars['Int']>;
  initialCumulativeValues: InitialCumulativeValues;
  monthly: Monthly;
  startDate: Scalars['Date'];
};

export type OverviewOld = {
  __typename?: 'OverviewOld';
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

export enum PageListStandard {
  Bills = 'bills',
  Food = 'food',
  General = 'general',
  Holiday = 'holiday',
  Income = 'income',
  Social = 'social'
}

export type PlanningAccount = {
  __typename?: 'PlanningAccount';
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
  __typename?: 'PlanningComputedValue';
  isTransfer: Scalars['Boolean'];
  isVerified: Scalars['Boolean'];
  key: Scalars['String'];
  month: Scalars['NonNegativeInt'];
  name: Scalars['String'];
  value: Scalars['Int'];
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
  __typename?: 'PlanningParameters';
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
  __typename?: 'PlanningSyncResponse';
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
  __typename?: 'PlanningValue';
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
  readFunds?: Maybe<ReadFundsResponse>;
  readIncome?: Maybe<IncomeReadResponse>;
  readList?: Maybe<ListReadResponse>;
  readNetWorthCategories?: Maybe<Array<NetWorthCategory>>;
  readNetWorthEntries?: Maybe<NetWorthEntryOverview>;
  readNetWorthSubcategories?: Maybe<Array<NetWorthSubcategory>>;
  receiptItem?: Maybe<Scalars['String']>;
  receiptItems?: Maybe<Array<ReceiptCategory>>;
  sankey?: Maybe<SankeyResponse>;
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
  __typename?: 'ReadFundsResponse';
  items: Array<Fund>;
};

export type ReceiptCategory = {
  __typename?: 'ReceiptCategory';
  category: Scalars['String'];
  item: Scalars['String'];
  page: ReceiptPage;
};

export type ReceiptCreated = {
  __typename?: 'ReceiptCreated';
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
  __typename?: 'ReceiptItem';
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

export type SankeyLink = {
  __typename?: 'SankeyLink';
  from: Scalars['String'];
  to: Scalars['String'];
  weight: Scalars['NonNegativeInt'];
};

export type SankeyResponse = {
  __typename?: 'SankeyResponse';
  links: Array<SankeyLink>;
};

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
  __typename?: 'SearchResult';
  error?: Maybe<Scalars['String']>;
  list: Array<Scalars['String']>;
  nextCategory?: Maybe<Array<Scalars['String']>>;
  nextField?: Maybe<Scalars['String']>;
  searchTerm?: Maybe<Scalars['String']>;
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
  __typename?: 'TargetDeltaResponse';
  allocationTarget: Scalars['NonNegativeInt'];
  id: Scalars['Int'];
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
  __typename?: 'UpdatedFundAllocationTargets';
  deltas?: Maybe<Array<TargetDeltaResponse>>;
  error?: Maybe<Scalars['String']>;
};

export type User = {
  __typename?: 'User';
  uid: Scalars['Int'];
};

export type UserInfo = {
  __typename?: 'UserInfo';
  name: Scalars['String'];
  uid: Scalars['Int'];
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
  & Pick<PlanningAccount, 'id' | 'account' | 'netWorthSubcategoryId' | 'upperLimit' | 'lowerLimit' | 'computedStartValue' | 'includeBills'>
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

export type ConfigQueryVariables = Exact<{ [key: string]: never; }>;


export type ConfigQuery = (
  { __typename?: 'Query' }
  & { config?: Maybe<(
    { __typename?: 'AppConfig' }
    & ConfigPartsFragment
  )> }
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
    & Pick<Overview, 'startDate' | 'endDate' | 'futureIncome'>
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
    & Pick<NetWorthCashTotal, 'cashInBank' | 'nonPensionStockValue' | 'pensionStockValue' | 'stocksIncludingCash' | 'date' | 'incomeSince' | 'spendingSince'>
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

export type ReadListStandardQueryVariables = Exact<{
  page: PageListStandard;
  offset: Scalars['Int'];
  limit: Scalars['Int'];
}>;


export type ReadListStandardQuery = (
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

export type ReadIncomeQueryVariables = Exact<{
  offset: Scalars['Int'];
  limit: Scalars['Int'];
}>;


export type ReadIncomeQuery = (
  { __typename?: 'Query' }
  & { readIncome?: Maybe<(
    { __typename?: 'IncomeReadResponse' }
    & Pick<IncomeReadResponse, 'olderExists' | 'weekly' | 'total'>
    & { items: Array<(
      { __typename?: 'Income' }
      & Pick<Income, 'id' | 'date' | 'item' | 'cost' | 'category' | 'shop'>
      & { deductions: Array<(
        { __typename?: 'IncomeDeduction' }
        & Pick<IncomeDeduction, 'name' | 'value'>
      )> }
    )>, totalDeductions?: Maybe<Array<(
      { __typename?: 'IncomeDeduction' }
      & Pick<IncomeDeduction, 'name' | 'value'>
    )>> }
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

export type ReadSankeyQueryVariables = Exact<{ [key: string]: never; }>;


export type ReadSankeyQuery = (
  { __typename?: 'Query' }
  & { sankey?: Maybe<(
    { __typename?: 'SankeyResponse' }
    & { links: Array<(
      { __typename?: 'SankeyLink' }
      & Pick<SankeyLink, 'from' | 'to' | 'weight'>
    )> }
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
    & Pick<IncomeSubscription, 'deleted' | 'overviewCost' | 'weekly' | 'total'>
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
    )>, totalDeductions?: Maybe<Array<(
      { __typename?: 'IncomeDeduction' }
      & Pick<IncomeDeduction, 'name' | 'value'>
    )>> }
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
    & Pick<NetWorthCashTotal, 'cashInBank' | 'nonPensionStockValue' | 'pensionStockValue' | 'stocksIncludingCash' | 'date' | 'incomeSince' | 'spendingSince'>
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
  includeBills
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
export const ConfigDocument = gql`
    query Config {
  config {
    ...ConfigParts
  }
}
    ${ConfigPartsFragmentDoc}`;

export function useConfigQuery(options: Omit<Urql.UseQueryArgs<ConfigQueryVariables>, 'query'> = {}) {
  return Urql.useQuery<ConfigQuery>({ query: ConfigDocument, ...options });
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
    futureIncome
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
    nonPensionStockValue
    pensionStockValue
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
export const ReadListStandardDocument = gql`
    query ReadListStandard($page: PageListStandard!, $offset: Int!, $limit: Int!) {
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

export function useReadListStandardQuery(options: Omit<Urql.UseQueryArgs<ReadListStandardQueryVariables>, 'query'> = {}) {
  return Urql.useQuery<ReadListStandardQuery>({ query: ReadListStandardDocument, ...options });
};
export const ReadIncomeDocument = gql`
    query ReadIncome($offset: Int!, $limit: Int!) {
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
    olderExists
    weekly
    total
    totalDeductions {
      name
      value
    }
  }
}
    `;

export function useReadIncomeQuery(options: Omit<Urql.UseQueryArgs<ReadIncomeQueryVariables>, 'query'> = {}) {
  return Urql.useQuery<ReadIncomeQuery>({ query: ReadIncomeDocument, ...options });
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
export const ReadSankeyDocument = gql`
    query ReadSankey {
  sankey {
    links {
      from
      to
      weight
    }
  }
}
    `;

export function useReadSankeyQuery(options: Omit<Urql.UseQueryArgs<ReadSankeyQueryVariables>, 'query'> = {}) {
  return Urql.useQuery<ReadSankeyQuery>({ query: ReadSankeyDocument, ...options });
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
    weekly
    total
    totalDeductions {
      name
      value
    }
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
    nonPensionStockValue
    pensionStockValue
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