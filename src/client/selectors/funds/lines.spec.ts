import numericHash from 'string-hash';
import {
  getOverallAbsolute,
  getFundLineAbsolute,
  getOverallROI,
  getFundLineROI,
  getOverallLine,
  getFundLine,
  getFundLineProcessed,
  FundsWithReturns,
  getFundLinePriceNormalised,
} from './lines';
import { GRAPH_FUNDS_OVERALL_ID, Mode } from '~client/constants/graph';

describe('Funds selectors / lines', () => {
  const id1 = numericHash('my-fund-id');
  const id2 = numericHash('my-second-fund-id');
  const id3 = numericHash('short-lived-fund');

  const fundsWithReturns: FundsWithReturns = {
    [id1]: [
      {
        startIndex: 0,
        values: [
          { price: 100, units: 34, cost: 3100, realised: 0 },
          { price: 102, units: 34, cost: 3100, realised: 0 },
          { price: 103, units: 18, cost: 1560, realised: 0 },
        ],
      },
    ],
    [id2]: [
      {
        startIndex: 2,
        values: [
          { price: 954, units: 105, cost: 975400, realised: 0 },
          { price: 961, units: 105, cost: 975400, realised: 0 },
        ],
      },
    ],
    [id3]: [
      {
        startIndex: 1,
        values: [{ price: 763, units: 591, cost: 918, realised: 0 }],
      },
    ],
  };

  const cacheTimes = [10000, 10030, 10632];

  describe(getOverallAbsolute.name, () => {
    it('should sum values and return a line', () => {
      expect.assertions(1);
      const result = getOverallAbsolute(fundsWithReturns);

      const expectedResult = [
        100 * 34 + 0 * 0,
        102 * 34 + 763 * 591,
        103 * 18 + 954 * 105,
        961 * 105,
      ];

      expect(result).toStrictEqual([{ startIndex: 0, values: expectedResult }]);
    });
  });

  describe(getFundLineAbsolute.name, () => {
    it.each`
      id     | startIndex | expectedResult
      ${id1} | ${0}       | ${[100 * 34, 102 * 34, 103 * 18]}
      ${id2} | ${2}       | ${[954 * 105, 961 * 105]}
      ${id3} | ${1}       | ${[763 * 591]}
    `('should get a list of values for id $id', ({ id, startIndex, expectedResult }) => {
      expect.assertions(1);

      const result = getFundLineAbsolute(fundsWithReturns, id);

      expect(result).toStrictEqual([{ startIndex, values: expectedResult }]);
    });
  });

  describe(getOverallROI.name, () => {
    it('should average ROIs and return a line', () => {
      expect.assertions(7);

      const result = getOverallROI(fundsWithReturns);

      const expectedResult = [
        (100 * (100 * 34 - 3100)) / 3100,
        (100 * (102 * 34 + 763 * 591 - (3100 + 918))) / (3100 + 918),
        (100 * (103 * 18 + 954 * 105 - (1560 + 975400))) / (1560 + 975400),
        (100 * (961 * 105 - 975400)) / 975400,
      ];

      expect(result).toHaveLength(1);
      expect(result[0].startIndex).toBe(0);
      expect(result[0].values).toHaveLength(expectedResult.length);
      result[0].values.forEach((value, index) =>
        expect(value).toBeCloseTo(expectedResult[index], 1),
      );
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
      expect.assertions(expectedResult.length + 2);

      const result = getFundLineROI(fundsWithReturns, id);

      expect(result).toHaveLength(1);
      expect(result[0].values).toHaveLength(expectedResult.length);
      result[0].values.forEach((value, index) => expect(value).toBeCloseTo(expectedResult[index]));
    });

    describe('for funds which were sold at a profit and re-bought', () => {
      const idRebought = numericHash('my-rebought-fund');
      const fundsWithReturnsRebought: FundsWithReturns = {
        [idRebought]: [
          {
            startIndex: 0,
            values: [
              {
                price: 100,
                units: 105,
                cost: 490000,
                realised: 0,
              },
            ],
          },
          {
            startIndex: 2,
            values: [
              {
                price: 103,
                units: 20,
                cost: 250000,
                realised: 670000,
              },
            ],
          },
        ],
      };

      it('should return multiple lines', () => {
        expect.assertions(2);
        const result = getFundLineROI(fundsWithReturnsRebought, idRebought);
        expect(result).toStrictEqual([
          { startIndex: 0, values: [expect.any(Number)] },
          { startIndex: 2, values: [expect.any(Number)] },
        ]);
        expect(result).toMatchInlineSnapshot(`
          Array [
            Object {
              "startIndex": 0,
              "values": Array [
                -97.86,
              ],
            },
            Object {
              "startIndex": 2,
              "values": Array [
                168.82,
              ],
            },
          ]
        `);
      });
    });
  });

  describe('getFundLinePriceNormalised', () => {
    const priceId1 = [100, 102, 103];
    const priceId2 = [100, (961 / 954) * 100];
    const priceId3 = [100];

    it.each`
      id     | expectedResult
      ${id1} | ${priceId1}
      ${id2} | ${priceId2}
      ${id3} | ${priceId3}
    `('should get a normalised list of prices for id $id', ({ id, expectedResult }) => {
      expect.assertions(expectedResult.length + 2);

      const result = getFundLinePriceNormalised(fundsWithReturns, id);

      expect(result).toHaveLength(1);
      expect(result[0].values).toHaveLength(expectedResult.length);
      result[0].values.forEach((value, index) => expect(value).toBeCloseTo(expectedResult[index]));
    });

    describe('for funds which were sold at a profit and re-bought', () => {
      const idRebought = numericHash('my-rebought-fund');
      const fundsWithReturnsRebought: FundsWithReturns = {
        [idRebought]: [
          {
            startIndex: 0,
            values: [
              {
                price: 90,
                units: 105,
                cost: 490000,
                realised: 0,
              },
            ],
          },
          {
            startIndex: 2,
            values: [
              {
                price: 107,
                units: 20,
                cost: 250000,
                realised: 670000,
              },
              {
                price: 83,
                units: 20,
                cost: 250000,
                realised: 670000,
              },
            ],
          },
        ],
      };

      it('should return multiple lines', () => {
        expect.assertions(2);
        const result = getFundLinePriceNormalised(fundsWithReturnsRebought, idRebought);
        expect(result).toStrictEqual([
          { startIndex: 0, values: [expect.any(Number)] },
          { startIndex: 2, values: [expect.any(Number), expect.any(Number)] },
        ]);
        expect(result).toMatchInlineSnapshot(`
          Array [
            Object {
              "startIndex": 0,
              "values": Array [
                100,
              ],
            },
            Object {
              "startIndex": 2,
              "values": Array [
                118.88888888888889,
                92.22222222222223,
              ],
            },
          ]
        `);
      });
    });
  });

  describe(getOverallLine.name, () => {
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

  describe(getFundLine.name, () => {
    const normalisedLine = expect.arrayContaining([
      {
        startIndex: expect.any(Number),
        values: expect.arrayContaining([expect.any(Number)]),
      },
    ]);

    describe.each`
      id     | priceLine
      ${id1} | ${[{ startIndex: 0, values: [100, 102, 103] }]}
      ${id2} | ${[{ startIndex: 2, values: [954, 961] }]}
      ${id3} | ${[{ startIndex: 1, values: [763] }]}
    `('for id $id', ({ id, priceLine }) => {
      describe.each`
        description     | mode                    | resultDescription     | getExpectedResult
        ${'absolute'}   | ${Mode.Value}           | ${'an absolute line'} | ${getFundLineAbsolute}
        ${'ROI'}        | ${Mode.ROI}             | ${'an ROI line'}      | ${getFundLineROI}
        ${'price'}      | ${Mode.Price}           | ${'a list of prices'} | ${priceLine}
        ${'normalised'} | ${Mode.PriceNormalised} | ${'a list of values'} | ${normalisedLine}
      `('if the mode is $description', ({ mode, resultDescription, getExpectedResult }) => {
        const expectedResult =
          typeof getExpectedResult === 'function'
            ? getExpectedResult(fundsWithReturns, id)
            : getExpectedResult;

        it(`should return ${resultDescription}`, () => {
          expect.assertions(1);
          expect(getFundLine(fundsWithReturns, mode, id)).toStrictEqual(expectedResult);
        });
      });
    });
  });

  describe(getFundLineProcessed.name, () => {
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

    describe('when processing an overall line', () => {
      it('should return a line', () => {
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

      it('should not separate the line', () => {
        expect.assertions(1);
        expect(
          getFundLineProcessed(
            {
              [id1]: [
                {
                  startIndex: 0,
                  values: [
                    { price: 100, units: 34, cost: 3100, realised: 0 },
                    { price: 92, units: 34, cost: 3128, realised: 0 },
                    { price: 103, units: 18, cost: 1560, realised: 0 },
                  ],
                },
              ],
            },
            cacheTimes,
            Mode.ROI,
            GRAPH_FUNDS_OVERALL_ID,
          ),
        ).toMatchInlineSnapshot(`
          Array [
            Array [
              Array [
                10000,
                9.68,
              ],
              Array [
                10030,
                0,
              ],
              Array [
                10632,
                18.85,
              ],
            ],
          ]
        `);
      });
    });
  });
});