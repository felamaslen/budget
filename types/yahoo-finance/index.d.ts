declare module 'yahoo-finance' {
  import { Options as HttpRequestOptions } from 'request';

  export enum Period {
    Daily = 'd',
    Weekly = 'w',
    Monthly = 'm',
    DividendsOnly = 'v',
  }

  type HistoricalOptionsCommon = {
    from: string;
    to: string;
    period?: Period;
  };

  export type HistoricalOptions = HistoricalOptionsCommon & {
    symbol: string;
  };

  export type HistoricalOptionsMultiple = HistoricalOptionsCommon & {
    symbols: string[];
  };

  export type QuoteHistorical = {
    date: Date;
    open: number;
    high: number;
    low: number;
    close: number;
    volume: number;
    adjClose: number;
    symbol: string;
  };

  export function historical(
    options: HistoricalOptions,
    httpRequestOptions?: HttpRequestOptions,
  ): Promise<QuoteHistorical[]>;

  export function historical(
    options: HistoricalOptionsMultiple,
    httpRequestOptions?: HttpRequestOptions,
  ): Promise<Record<string, QuoteHistorical[]>>;

  export type QuoteModule =
    | 'recommendationTrend'
    | 'summaryDetail'
    | 'earnings'
    | 'calendarEvents'
    | 'upgradeDowngradeHistory'
    | 'price'
    | 'defaultKeyStatistics'
    | 'summaryProfile'
    | 'financialData';

  export type QuoteOptions<M extends QuoteModule> = {
    modules: M[];
    symbol: string;
  };

  export type QuoteOptionsMultiple<M extends QuoteModule, S extends string> = Omit<
    QuoteOptions<M>,
    'symbol'
  > & {
    symbols: S[];
  };

  type QuoteBase = {
    recommendationTrend: {
      trend: {
        period: string;
        strongBuy: number;
        buy: number;
        hold: number;
        sell: number;
        strongSell: number;
      }[];
      maxAge: number;
    };
    summaryDetail: {
      maxAge: number;
      priceHint: number;
      previousClose: number;
      open: number;
      dayLow: number;
      dayHigh: number;
      regularMarketPreviousClose: number;
      regularMarketOpen: number;
      regularMarketDayLow: number;
      regularMarketDayHigh: number;
      dividendRate: number;
      dividendYield: number;
      exDividendDate: Date;
      payoutRatio: number;
      fiveYearAvgDividendYield: number;
      beta: number;
      trailingPE: number;
      forwardPE: number;
      volume: number;
      regularMarketVolume: number;
      averageVolume: number;
      averageVolume10days: number;
      averageDailyVolume10Day: number;
      bid: number;
      ask: number;
      bidSize: number;
      askSize: number;
      marketCap: number;
      fiftyTwoWeekLow: number;
      fiftyTwoWeekHigh: number;
      priceToSalesTrailing12Months: number;
      fiftyDayAverage: number;
      twoHundredDayAverage: number;
      trailingAnnualDividendRate: number;
      trailingAnnualDividendYield: number;
    };
    earnings: {
      maxAge: number;
      earningsChart: {
        quarterly: {
          date: string;
          actual: number;
          estimate: number;
        }[];
        currentQuarterEstimate: number;
        currentQuarterEstimateDate: string;
        currentQuarterEstimateYear: number;
      };
      financialsChart: {
        yearly: {
          date: number;
          revenue: number;
          earnings: number;
        }[];
        quarterly: {
          date: string;
          revenue: number;
          earnings: number;
        }[];
      };
    };
    calendarEvents: {
      maxAge: number;
      earnings: {
        earningsDate: number[];
        earningsAverage: number;
        earningsLow: number;
        earningsHigh: number;
        revenueAverage: number;
        revenueLow: number;
        revenueHigh: number;
      };
      exDividendDate: Date;
      dividendDate: Date;
    };
    upgradeDowngradeHistory: {
      history: {
        epochGradeDate: Date;
        firm: string;
        toGrade: string;
        fromGrade: string;
        action: string;
      }[];
    };
    price: {
      maxAge: number;
      preMarketChangePercent: number;
      preMarketChange: number;
      preMarketTime: Date;
      preMarketPrice: number;
      preMarketSource: string;
      postMarketChangePercent: number;
      postMarketChange: number;
      postMarketTime: Date;
      postMarketPrice: number;
      postMarketSource: string;
      regularMarketChangePercent: number;
      regularMarketChange: number;
      regularMarketTime: Date;
      priceHint: number;
      regularMarketPrice: number;
      regularMarketDayHigh: number;
      regularMarketDayLow: number;
      regularMarketVolume: number;
      averageDailyVolume10Day: number;
      averageDailyVolume3Month: number;
      regularMarketPreviousClose: number;
      regularMarketSource: string;
      regularMarketOpen: number;
      exchange: string;
      exchangeName: string;
      marketState: string;
      quoteType: string;
      symbol: string;
      underlyingSymbol: string | null;
      shortName: string;
      longName: string;
      currency: string;
      quoteSourceName: string;
      currencySymbol: string;
    };
    defaultKeyStatistics: {
      maxAge: number;
      forwardPE: number;
      profitMargins: number;
      floatShares: number;
      sharesOutstanding: number;
      sharesShort: number;
      sharesShortPriorMonth: number;
      heldPercentInsiders: number;
      heldPercentInstitutions: number;
      shortRatio: number;
      shortPercentOfFloat: number;
      beta: number;
      category: null;
      bookValue: number;
      priceToBook: number;
      fundFamily: null;
      legalType: null;
      lastFiscalYearEnd: Date;
      nextFiscalYearEnd: Date;
      mostRecentQuarter: Date;
      netIncomeToCommon: number;
      trailingEps: number;
      forwardEps: number;
      pegRatio: number;
      lastSplitFactor: string;
      lastSplitDate: Date;
      '52WeekChange': number;
      SandP52WeekChange: number;
    };
    summaryProfile: {
      address1: string;
      city: string;
      state: string;
      zip: string;
      country: string;
      phone: string;
      website: string;
      industry: string;
      sector: string;
      longBusinessSummary: string;
      fullTimeEmployees: number;
      companyOfficers: [];
      maxAge: number;
    };
    financialData: {
      maxAge: number;
      currentPrice: number;
      targetHighPrice: number;
      targetLowPrice: number;
      targetMeanPrice: number;
      targetMedianPrice: number;
      recommendationMean: number;
      recommendationKey: string;
      numberOfAnalystOpinions: number;
      totalCash: number;
      totalCashPerShare: number;
      ebitda: number;
      totalDebt: number;
      quickRatio: number;
      currentRatio: number;
      totalRevenue: number;
      debtToEquity: number;
      revenuePerShare: number;
      returnOnAssets: number;
      returnOnEquity: number;
      grossProfits: number;
      freeCashflow: number;
      operatingCashflow: number;
      revenueGrowth: number;
      grossMargins: number;
      ebitdaMargins: number;
      operatingMargins: number;
      profitMargins: number;
    };
  };

  export type Quote<M extends QuoteModule = QuoteModule> = Record<M, QuoteBase[M]>;

  export function quote<M extends QuoteModule = QuoteModule>(
    options: QuoteOptions<M>,
    optionalHttpRequestOptions?: Partial<HttpRequestOptions>,
  ): Promise<Quote<M> | null | undefined>;

  export function quote<M extends QuoteModule, S extends string>(
    options: QuoteOptionsMultiple<M, S>,
    optionalHttpRequestOptions?: Partial<HttpRequestOptions>,
  ): Promise<Record<S, Quote<M> | null | undefined>>;

  export function quote<M extends QuoteModule = QuoteModule>(
    symbol: string,
    modules: M[],
  ): Promise<Quote<M> | null | undefined>;
}
