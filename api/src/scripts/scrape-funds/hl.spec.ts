import * as nock from 'nock';
import path from 'path';
import fs from 'fs-extra';
import {
  isHLFundShare,
  getHoldingsFromDataHL,
  getPriceFromDataHL,
  getFundUrlHL,
} from '~api/scripts/scrape-funds/hl';
import { Fund } from './types';

describe('Fund scraper - HL', () => {
  const testFileFund = path.resolve(__dirname, './__tests__/fund-test-hl.html');
  const testFileShare = path.resolve(__dirname, './__tests__/share-test-hl.html');
  const testFileShareFX = path.resolve(__dirname, './__tests__/share-test-hl-dollar.html');

  let testDataFund: string;
  let testDataShare: string;
  let testDataShareFX: string;

  beforeAll(async () => {
    nock.disableNetConnect();
    nock.enableNetConnect('127.0.0.1');

    [testDataFund, testDataShare, testDataShareFX] = await Promise.all([
      fs.readFile(testFileFund, 'utf8'),
      fs.readFile(testFileShare, 'utf8'),
      fs.readFile(testFileShareFX, 'utf8'),
    ]);
  });

  afterAll(() => {
    nock.enableNetConnect();
  });

  describe('isHLFundShare', () => {
    it('returns true for GBX shares', () => {
      const fund: Pick<Fund, 'name'> = {
        name: 'City of London Investment Trust ORD 25p (share)',
      };

      expect(isHLFundShare(fund)).toBe(true);
    });

    it('returns true for foreign shares', () => {
      const fund: Pick<Fund, 'name'> = {
        name: 'Apple Inc Com Stk NPV (share)',
      };

      expect(isHLFundShare(fund)).toBe(true);
    });

    it('returns false for funds', () => {
      const fund: Pick<Fund, 'name'> = {
        name: 'Jupiter Asian Income Class I (accum.)',
      };

      expect(isHLFundShare(fund)).toBe(false);
    });
  });

  describe('getHoldingsFromDataHL', () => {
    it('returns holdings for funds', () => {
      const fund: Pick<Fund, 'name'> = {
        name: 'Jupiter Asian Income Class I (accum.)',
      };

      expect(getHoldingsFromDataHL(fund, testDataFund)).toEqual([
        {
          name: 'Majedie UK Equity Class X',
          value: 9.85,
        },
        {
          name: 'Woodford CF Woodford Equity Income Class Z',
          value: 9.79,
        },
        {
          name: 'J O Hambro CM UK Equity Income Class B',
          value: 9.69,
        },
        {
          name: 'Jupiter UK Special Situations Class I',
          value: 9.67,
        },
        {
          name: 'River &amp; Mercantile UK Dynamic Equity Class B',
          value: 9.2,
        },
        {
          name: 'Lindsell Train UK Equity Class D Accumulation Shares',
          value: 9.17,
        },
        {
          name: 'Marlborough UK Micro-Cap Growth Class P',
          value: 9.04,
        },
        {
          name: 'Old Mutual Global Investors (Offshore) UK Smaller Companies Focus Class A',
          value: 7.86,
        },
        {
          name: 'Marlborough Multi Cap Income Class P',
          value: 7.61,
        },
        {
          name: 'AXA Framlington UK Select Opportunities Class ZI',
          value: 6.97,
        },
      ]);
    });

    it('returns holdings for shares', () => {
      const fund: Pick<Fund, 'name'> = {
        name: 'City of London Investment Trust ORD 25p (share)',
      };

      expect(getHoldingsFromDataHL(fund, testDataShare)).toEqual([
        {
          name: 'British American Tobacco plc Ordinary 25p',
          value: 4.94,
        },
        {
          name: 'HSBC Holdings plc Ordinary USD0.50',
          value: 4.34,
        },
        {
          name: 'Diageo plc Ordinary 28 101/108p',
          value: 2.95,
        },
        {
          name: 'Royal Dutch Shell Plc B Shares EUR0.07',
          value: 2.87,
        },
        {
          name: 'Unilever plc Ordinary 3.11p',
          value: 2.73,
        },
        {
          name: 'Vodafone Group plc USD0.20 20/21',
          value: 2.71,
        },
        {
          name: 'Prudential plc Ordinary 5p',
          value: 2.68,
        },
        {
          name: 'GlaxoSmithKline plc Ordinary 25p',
          value: 2.54,
        },
        {
          name: 'Lloyds Banking Group plc Ordinary 10p',
          value: 2.53,
        },
        {
          name: 'BP Plc Ordinary US$0.25',
          value: 2.5,
        },
      ]);
    });

    it('returns an empty array for shares without holdings', () => {
      const fund: Pick<Fund, 'name'> = {
        name: 'Apple Inc Com Stk NPV (share)',
      };

      expect(getHoldingsFromDataHL(fund, testDataShareFX)).toEqual([]);
    });
  });

  describe('getPriceFromDataHL', () => {
    it('should parse the test fund data', () => {
      expect(getPriceFromDataHL(testDataFund)).toEqual(130.31);
    });

    it('should parse the test share data', () => {
      expect(getPriceFromDataHL(testDataShare)).toEqual(424.1);
    });

    it('should parse the dollar share data and convert the price from USD to GBP', () => {
      const currencyPrices = {
        GBP: 0.76746,
      };

      expect(getPriceFromDataHL(testDataShareFX, currencyPrices)).toEqual(22582 * 0.76746);
    });

    it('should throw an error on dollar share data if there are no currency data', () => {
      expect(() => getPriceFromDataHL(testDataShareFX)).toThrow();
      expect(() => getPriceFromDataHL(testDataShareFX, {})).toThrow();
    });

    it('should throw a nice error if given bad data', () => {
      expect(() => getPriceFromDataHL('flkjflkjavl;kj')).toThrow(
        'Scraped data formatted incorrectly',
      );
    });
  });

  describe('getFundUrlHL', () => {
    it('should handle funds', () => {
      const fund = {
        name: 'CF Lindsell Train UK Equity Class D (accum.)',
      };

      const url =
        // eslint-disable-next-line max-len
        'http://www.hl.co.uk/funds/fund-discounts,-prices--and--factsheets/search-results/c/cf-lindsell-train-uk-equity-class-d-accumulation';

      expect(getFundUrlHL(fund)).toBe(url);
    });

    it('should handle accumulation-inclusive funds', () => {
      const fund = {
        name: 'Threadneedle UK Equity Income Class 1 (accum-inc.)',
      };

      const url =
        // eslint-disable-next-line max-len
        'http://www.hl.co.uk/funds/fund-discounts,-prices--and--factsheets/search-results/t/threadneedle-uk-equity-income-class-1-accumulation-inclusive';

      expect(getFundUrlHL(fund)).toBe(url);
    });

    it('should handle shares', () => {
      const fund = {
        name: 'City of London Investment Trust ORD 25p (share)',
      };

      const url =
        'http://www.hl.co.uk/shares/shares-search-results/c/city-of-london-investment-trust-ord-25p';

      expect(getFundUrlHL(fund)).toBe(url);
    });

    it('should handle dollar shares', () => {
      const fund = {
        name: 'Apple Inc Com Stk NPV (share)',
      };

      const url = 'http://www.hl.co.uk/shares/shares-search-results/a/apple-inc-com-stk-npv';

      expect(getFundUrlHL(fund)).toBe(url);
    });
  });
});
