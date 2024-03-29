import path from 'path';
import fs from 'fs-extra';
import { isHLFundShare, getHoldingsFromDataHL, getPriceFromDataHL, getFundUrlHL } from './hl';
import { Fund } from './types';

describe('fund scraper - HL', () => {
  const testFileFund = path.resolve(__dirname, './vendor/fund-test-hl.html');
  const testFileShare = path.resolve(__dirname, './vendor/share-test-hl.html');
  const testFileShareComma = path.resolve(__dirname, './vendor/share-test-hl-comma.html');
  const testFileShareFX = path.resolve(__dirname, './vendor/share-test-hl-dollar.html');

  let testDataFund: string;
  let testDataShare: string;
  let testDataShareComma: string;
  let testDataShareFX: string;

  beforeAll(async () => {
    [testDataFund, testDataShare, testDataShareComma, testDataShareFX] = await Promise.all([
      fs.readFile(testFileFund, 'utf8'),
      fs.readFile(testFileShare, 'utf8'),
      fs.readFile(testFileShareComma, 'utf8'),
      fs.readFile(testFileShareFX, 'utf8'),
    ]);
  });

  describe('isHLFundShare', () => {
    it('returns true for GBX shares', () => {
      expect.assertions(1);
      const fund: Pick<Fund, 'name'> = {
        name: 'City of London Investment Trust ORD 25p (share)',
      };

      expect(isHLFundShare(fund)).toBe(true);
    });

    it('returns true for foreign shares', () => {
      expect.assertions(1);
      const fund: Pick<Fund, 'name'> = {
        name: 'Apple Inc Com Stk NPV (share)',
      };

      expect(isHLFundShare(fund)).toBe(true);
    });

    it('returns false for funds', () => {
      expect.assertions(1);
      const fund: Pick<Fund, 'name'> = {
        name: 'Jupiter Asian Income Class I (accum.)',
      };

      expect(isHLFundShare(fund)).toBe(false);
    });
  });

  describe('getHoldingsFromDataHL', () => {
    it('returns holdings for funds', () => {
      expect.assertions(1);
      const fund: Pick<Fund, 'name'> = {
        name: 'Jupiter Asian Income Class I (accum.)',
      };

      expect(getHoldingsFromDataHL(fund, testDataFund)).toStrictEqual([
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
      expect.assertions(1);
      const fund: Pick<Fund, 'name'> = {
        name: 'City of London Investment Trust ORD 25p (share)',
      };

      expect(getHoldingsFromDataHL(fund, testDataShare)).toStrictEqual([
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
      expect.assertions(1);
      const fund: Pick<Fund, 'name'> = {
        name: 'Apple Inc Com Stk NPV (share)',
      };

      expect(getHoldingsFromDataHL(fund, testDataShareFX)).toHaveLength(0);
    });
  });

  describe('getPriceFromDataHL', () => {
    it('should parse the test fund data', () => {
      expect.assertions(1);
      expect(getPriceFromDataHL(testDataFund)).toBe(130.31);
    });

    it('should parse the test share data', () => {
      expect.assertions(1);
      expect(getPriceFromDataHL(testDataShare)).toBe(424.1);
    });

    it('should parse the dollar share data and convert the price from USD to GBP', () => {
      expect.assertions(1);
      const currencyPrices = {
        GBP: 0.76746,
      };

      expect(getPriceFromDataHL(testDataShareFX, currencyPrices)).toBe(22582 * 0.76746);
    });

    it('should handle data where there is a comma in the price', () => {
      expect.assertions(1);
      expect(getPriceFromDataHL(testDataShareComma)).toBe(1862);
    });

    it('should throw an error on dollar share data if there are no currency data', () => {
      expect.assertions(2);
      expect(() => getPriceFromDataHL(testDataShareFX)).toThrowErrorMatchingInlineSnapshot(
        `"no GBP/USD currency conversion available"`,
      );
      expect(() => getPriceFromDataHL(testDataShareFX, {})).toThrowErrorMatchingInlineSnapshot(
        `"no GBP/USD currency conversion available"`,
      );
    });

    it('should throw a nice error if given bad data', () => {
      expect.assertions(1);
      expect(() => getPriceFromDataHL('flkjflkjavl;kj')).toThrow(
        'Scraped data formatted incorrectly',
      );
    });
  });

  describe('getFundUrlHL', () => {
    it('should handle funds', () => {
      expect.assertions(1);
      const fund = {
        name: 'CF Lindsell Train UK Equity Class D (accum.)',
      };

      const url =
        // eslint-disable-next-line max-len
        'https://www.hl.co.uk/funds/fund-discounts,-prices--and--factsheets/search-results/c/cf-lindsell-train-uk-equity-class-d-accumulation';

      expect(getFundUrlHL(fund)).toBe(url);
    });

    it('should handle accumulation-inclusive funds', () => {
      expect.assertions(1);
      const fund = {
        name: 'Threadneedle UK Equity Income Class 1 (accum-inc.)',
      };

      const url =
        // eslint-disable-next-line max-len
        'https://www.hl.co.uk/funds/fund-discounts,-prices--and--factsheets/search-results/t/threadneedle-uk-equity-income-class-1-accumulation-inclusive';

      expect(getFundUrlHL(fund)).toBe(url);
    });

    it('should handle shares', () => {
      expect.assertions(1);
      const fund = {
        name: 'City of London Investment Trust ORD 25p (share)',
      };

      const url =
        'https://www.hl.co.uk/shares/shares-search-results/c/city-of-london-investment-trust-ord-25p';

      expect(getFundUrlHL(fund)).toBe(url);
    });

    it('should handle dollar shares', () => {
      expect.assertions(1);
      const fund = {
        name: 'Apple Inc Com Stk NPV (share)',
      };

      const url = 'https://www.hl.co.uk/shares/shares-search-results/a/apple-inc-com-stk-npv';

      expect(getFundUrlHL(fund)).toBe(url);
    });
  });
});
