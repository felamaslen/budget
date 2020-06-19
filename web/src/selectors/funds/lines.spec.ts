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
  const id3 = 'short-lived-fund';

  const fundsWithReturns = {
    [id1]: {
      startIndex: 0,
      returns: [
        { price: 100, units: 34, cost: 3100 },
        { price: 102, units: 34, cost: 3100 },
        { price: 103, units: 18, cost: 1560 },
      ],
    },
    [id2]: {
      startIndex: 2,
      returns: [
        { price: 954, units: 105, cost: 975400 },
        { price: 961, units: 105, cost: 975400 },
      ],
    },
    [id3]: {
      startIndex: 1,
      returns: [{ price: 763, units: 591, cost: 918 }],
    },
  };

  const cacheTimes = [10000, 10030, 10632];

  describe('getOverallAbsolute', () => {
    it('should sum values and return a line', () => {
      expect.assertions(1);
      const result = getOverallAbsolute(fundsWithReturns);

      const expectedResult = [
        100 * 34 + 0 * 0,
        102 * 34 + 763 * 591,
        103 * 18 + 954 * 105,
        961 * 105,
      ];

      expect(result).toStrictEqual(expectedResult);
    });
  });

  describe('getFundLineAbsolute', () => {
    it.each`
      id     | expectedResult
      ${id1} | ${[100 * 34, 102 * 34, 103 * 18]}
      ${id2} | ${[954 * 105, 961 * 105]}
      ${id3} | ${[763 * 591]}
    `('should get a list of values for id $id', ({ id, expectedResult }) => {
      expect.assertions(1);

      const result = getFundLineAbsolute(fundsWithReturns, id);

      expect(result).toStrictEqual(expectedResult);
    });
  });

  describe('getOverallROI', () => {
    it('should average ROIs and return a line', () => {
      expect.assertions(5);

      const result = getOverallROI(fundsWithReturns);

      const expectedResult = [
        (100 * (100 * 34 - 3100)) / 3100,
        (100 * (102 * 34 + 763 * 591 - (3100 + 918))) / (3100 + 918),
        (100 * (103 * 18 + 954 * 105 - (1560 + 975400))) / (1560 + 975400),
        (100 * (961 * 105 - 975400)) / 975400,
      ];

      expect(result).toHaveLength(expectedResult.length);
      result.forEach((value, index) => expect(value).toBeCloseTo(expectedResult[index], 1));
    });
  });

  describe('getFundLineROI', () => {
    const roiId1 = [
      (100 * (100 * 34 - 3100)) / 3100,
      (100 * (102 * 34 - 3100)) / 3100,
      (100 * (103 * 18 - 1560)) / 1560,
    ];
    const roiId2 = [(100 * (954 * 105 - 975400)) / 975400, (100 * (961 * 105 - 975400)) / 975400];
    const roiId3 = [(100 * (763 * 591 - 918)) / 918];

    it.each`
      id     | expectedResult
      ${id1} | ${roiId1}
      ${id2} | ${roiId2}
      ${id3} | ${roiId3}
    `('should get a list of ROIs for id $id', ({ id, expectedResult }) => {
      expect.assertions(expectedResult.length + 1);

      const result = getFundLineROI(fundsWithReturns, id);

      expect(result).toHaveLength(expectedResult.length);
      result.forEach((value, index) => expect(value).toBeCloseTo(expectedResult[index]));
    });

    describe('for funds which were sold at a profit and re-bought', () => {
      const idRebought = 'my-rebought-fund';
      const fundsWithReturnsRebought = {
        [idRebought]: {
          startIndex: 0,
          returns: [
            {
              price: 100,
              units: 105,
              cost: 49,
            },
            {
              price: 0,
              units: 0,
              cost: -18,
            },
            {
              price: 103,
              units: 20,
              cost: 25,
            },
          ],
        },
      };

      it('should set the values while fully sold to zero', () => {
        expect.assertions(1);
        const result = getFundLineROI(fundsWithReturnsRebought, idRebought);
        expect(result).toStrictEqual([expect.any(Number), 0, expect.any(Number)]);
      });
    });
  });

  describe('getOverallLine', () => {
    const overallAbsolute = getOverallAbsolute(fundsWithReturns);
    const overallROI = getOverallROI(fundsWithReturns);
    const overallPrice: number[] = [];

    describe.each`
      description   | mode          | resultDescription     | expectedResult
      ${'absolute'} | ${Mode.Value} | ${'an absolute line'} | ${overallAbsolute}
      ${'ROI'}      | ${Mode.ROI}   | ${'an ROI line'}      | ${overallROI}
      ${'price'}    | ${Mode.Price} | ${'an empty line'}    | ${overallPrice}
    `('if the mode is $description', ({ mode, resultDescription, expectedResult }) => {
      it(`should return ${resultDescription}`, () => {
        expect.assertions(1);
        expect(getOverallLine(fundsWithReturns, mode)).toStrictEqual(expectedResult);
      });
    });
  });

  describe('getFundLine', () => {
    describe.each`
      id     | priceLine
      ${id1} | ${[100, 102, 103]}
      ${id2} | ${[954, 961]}
      ${id3} | ${[763]}
    `('for id $id', ({ id, priceLine }) => {
      describe.each`
        description   | mode          | resultDescription     | getExpectedResult
        ${'absolute'} | ${Mode.Value} | ${'an absolute line'} | ${getFundLineAbsolute}
        ${'ROI'}      | ${Mode.ROI}   | ${'an ROI line'}      | ${getFundLineROI}
        ${'price'}    | ${Mode.Price} | ${'a list of prices'} | ${(): number[] => priceLine}
      `('if the mode is $description', ({ mode, resultDescription, getExpectedResult }) => {
        const expectedResult = getExpectedResult(fundsWithReturns, id);

        it(`should return ${resultDescription}`, () => {
          expect.assertions(1);
          expect(getFundLine(fundsWithReturns, mode, id)).toStrictEqual(expectedResult);
        });
      });
    });
  });

  describe('getFundLineProcessed', () => {
    it('should process a normal fund line', () => {
      expect.assertions(1);
      expect(getFundLineProcessed(fundsWithReturns, cacheTimes, Mode.ROI, id1))
        .toMatchInlineSnapshot(`
        Array [
          Array [
            Array [
              10000,
              9.68,
            ],
            Array [
              10030,
              11.87,
            ],
            Array [
              10632,
              18.85,
            ],
          ],
        ]
      `);
    });

    it('should process an overall line', () => {
      expect.assertions(1);
      expect(getFundLineProcessed(fundsWithReturns, cacheTimes, Mode.ROI, GRAPH_FUNDS_OVERALL_ID))
        .toMatchInlineSnapshot(`
        Array [
          Array [
            Array [
              10000,
              9.68,
            ],
            Array [
              10030,
              11209.13,
            ],
            Array [
              10632,
              -89.57,
            ],
            Array [
              undefined,
              -89.68,
            ],
          ],
        ]
      `);
    });
  });
});
