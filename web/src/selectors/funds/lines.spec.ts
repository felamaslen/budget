import {
  getOverallAbsolute,
  getFundLineAbsolute,
  getOverallROI,
  getFundLineROI,
  getOverallLine,
  getFundLine,
  getFundLineProcessed,
} from './lines';
import { GRAPH_FUNDS_OVERALL_ID, Mode } from '~client/constants/graph';

describe('Funds selectors / lines', () => {
  const id1 = 'my-fund-id';
  const id2 = 'my-second-fund-id';

  const priceUnitsCosts = {
    prices: {
      [id1]: [100, 102, 103],
      [id2]: [954, 961],
    },
    units: {
      [id1]: [34, 34, 18],
      [id2]: [105, 105],
    },
    costs: {
      [id1]: [3100, 3100, 1560],
      [id2]: [975400, 975400],
    },
  };

  const timeOffsets = {
    [id1]: 0,
    [id2]: 1,
  };

  const times = [10000, 10030, 10632];

  describe('getOverallAbsolute', () => {
    const prices = {
      id1: [100, 102, 103],
      id2: [0, 400, 399, 380, 386],
    };

    const units = {
      id1: [10, 10, 11],
      id2: [0, 34, 34, 34, 28],
    };

    it('should sum prices and return a line', () => {
      expect.assertions(1);
      const result = getOverallAbsolute(prices, units);

      const expectedResult = [
        100 * 10 + 0 * 0,
        102 * 10 + 400 * 34,
        103 * 11 + 399 * 34,
        380 * 34,
        386 * 28,
      ];

      expect(result).toStrictEqual(expectedResult);
    });
  });

  describe('getFundLineAbsolute', () => {
    it('should get the mapped product of units and prices', () => {
      expect.assertions(1);
      const id = 'my-fund-id';
      const prices = { [id]: [100, 102, 103] };
      const units = { [id]: [34, 34, 18] };

      const result = getFundLineAbsolute(prices, units, id);

      const expectedResult = [3400, 3468, 1854];

      expect(result).toStrictEqual(expectedResult);
    });
  });

  describe('getOverallROI', () => {
    const prices = {
      id1: [100, 102, 103],
      id2: [0, 400, 399, 380, 386],
      id3: [30, 31, 29, 0, 31],
    };

    const units = {
      id1: [10, 10, 11],
      id2: [0, 34, 34, 34, 28],
      id3: [10, 10, 10, 10, 10],
    };

    const costs = {
      id1: [1000, 1000, 1200],
      id2: [0, 14000, 14000, 14000, 10800],
      id3: [300, 300, 300, 300, 300],
    };

    const rounded = (value: number): number => Number(value.toPrecision(8));

    it('should get the correct value and return a line', () => {
      expect.assertions(1);
      const result = getOverallROI(prices, units, costs);

      const expectedResult = [
        0,
        100 * ((102 * 10 + 400 * 34 + 31 * 10 - (1000 + 14000 + 300)) / (1000 + 14000 + 300)),
        100 * ((103 * 11 + 399 * 34 + 29 * 10 - (1200 + 14000 + 300)) / (1200 + 14000 + 300)),
        100 * ((380 * 34 - 14000) / 14000),
        100 * ((386 * 28 + 31 * 10 - (10800 + 300)) / (10800 + 300)),
      ];

      expect(result.map(rounded)).toStrictEqual(expectedResult.map(rounded));
    });
  });

  describe('getFundLineROI', () => {
    const id = 'my-fund-id';
    const prices = { [id]: [100, 102, 103] };
    const units = { [id]: [34, 34, 18] };
    const costs = { [id]: [3100, 3100, 1560] };

    it('should get the correct values and return a line', () => {
      expect.assertions(1);
      const result = getFundLineROI({ prices, units, costs }, id);

      const expectedResult = [
        100 * ((100 * 34 - 3100) / 3100),
        100 * ((102 * 34 - 3100) / 3100),
        100 * ((103 * 18 - 1560) / 1560),
      ];

      expect(result).toStrictEqual(expectedResult);
    });
  });

  describe('getOverallLine', () => {
    it('should return an absolute line if the mode is absolute', () => {
      expect.assertions(1);
      expect(getOverallLine(priceUnitsCosts, Mode.Value, timeOffsets)).toStrictEqual([
        100 * 34 + 0,
        102 * 34 + 954 * 105,
        103 * 18 + 961 * 105,
      ]);
    });

    it('should return an ROI line if the mode is ROI', () => {
      expect.assertions(1);
      expect(getOverallLine(priceUnitsCosts, Mode.ROI, timeOffsets)).toStrictEqual([
        100 * ((100 * 34 + 0 - (3100 + 0)) / (3100 + 0)),
        100 * ((102 * 34 + 954 * 105 - (3100 + 975400)) / (3100 + 975400)),
        100 * ((103 * 18 + 961 * 105 - (1560 + 975400)) / (1560 + 975400)),
      ]);
    });

    it('should return null if the mode is price', () => {
      expect.assertions(1);
      expect(getOverallLine(priceUnitsCosts, Mode.Price, timeOffsets)).toBeNull();
    });
  });

  describe('getFundLine', () => {
    it('should return an absolute line if the mode is absolute', () => {
      expect.assertions(2);
      expect(getFundLine(priceUnitsCosts, Mode.Value, id1)).toStrictEqual([
        100 * 34,
        102 * 34,
        103 * 18,
      ]);

      expect(getFundLine(priceUnitsCosts, Mode.Value, id2)).toStrictEqual([954 * 105, 961 * 105]);
    });

    it('should return an ROI line if the mode is ROI', () => {
      expect.assertions(2);
      expect(getFundLine(priceUnitsCosts, Mode.ROI, id1)).toStrictEqual([
        100 * ((100 * 34 - 3100) / 3100),
        100 * ((102 * 34 - 3100) / 3100),
        100 * ((103 * 18 - 1560) / 1560),
      ]);

      expect(getFundLine(priceUnitsCosts, Mode.ROI, id2)).toStrictEqual([
        100 * ((954 * 105 - 975400) / 975400),
        100 * ((961 * 105 - 975400) / 975400),
      ]);
    });

    it('should return a price line if the mode is price', () => {
      expect.assertions(2);
      expect(getFundLine(priceUnitsCosts, Mode.Price, id1)).toStrictEqual([100, 102, 103]);

      expect(getFundLine(priceUnitsCosts, Mode.Price, id2)).toStrictEqual([954, 961]);
    });
  });

  describe('getFundLineProcessed', () => {
    it('should process a normal fund line', () => {
      expect.assertions(1);
      expect(
        getFundLineProcessed(times, timeOffsets, priceUnitsCosts, Mode.ROI, id1),
      ).toStrictEqual([
        [
          [10000, 100 * ((100 * 34 - 3100) / 3100)],
          [10030, 100 * ((102 * 34 - 3100) / 3100)],
          [10632, 100 * ((103 * 18 - 1560) / 1560)],
        ],
      ]);
    });

    it('should process an overall line', () => {
      expect.assertions(1);
      expect(
        getFundLineProcessed(times, timeOffsets, priceUnitsCosts, Mode.ROI, GRAPH_FUNDS_OVERALL_ID),
      ).toStrictEqual([
        [
          [10000, 100 * ((100 * 34 + 0 - (3100 + 0)) / (3100 + 0))],
          [10030, 100 * ((102 * 34 + 954 * 105 - (3100 + 975400)) / (3100 + 975400))],
          [10632, 100 * ((103 * 18 + 961 * 105 - (1560 + 975400)) / (1560 + 975400))],
        ],
      ]);
    });
  });
});
