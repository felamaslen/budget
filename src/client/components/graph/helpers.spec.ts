import { transformToMovingAverage } from './helpers';

import type { Data } from '~client/types';

describe('graph (component) helpers', () => {
  describe(transformToMovingAverage.name, () => {
    it('should get the moving average of a time series', () => {
      expect.assertions(1);

      const timeSeries: Data = [
        [106, 675],
        [107, 482],
        [200, 1076],
        [201, 998],
      ];

      expect(transformToMovingAverage(timeSeries, 3)).toStrictEqual<Data>([
        [106, 675],
        [107, (482 + 675) / 2],
        [200, (1076 + 482 + 675) / 3],
        [201, (998 + 1076 + 482) / 3],
      ]);
    });

    it('should get the time-weighted (rebased) moving average of a time series', () => {
      expect.assertions(2);

      const timeSeries: Data = [
        [10, 105],
        [12, 97],
        [32, 364],
        [52, 406],
      ];

      const interpolatedTimeSeries: Data = [
        [10, 105],
        [12, 97],
        [14, 97 + (2 / 20) * ((364 * 2) / 20 - 97)],
        [16, 97 + (4 / 20) * ((364 * 2) / 20 - 97)],
        [18, 97 + (6 / 20) * ((364 * 2) / 20 - 97)],
        [20, 97 + (8 / 20) * ((364 * 2) / 20 - 97)],
        [22, 97 + (10 / 20) * ((364 * 2) / 20 - 97)],
        [24, 97 + (12 / 20) * ((364 * 2) / 20 - 97)],
        [26, 97 + (14 / 20) * ((364 * 2) / 20 - 97)],
        [28, 97 + (16 / 20) * ((364 * 2) / 20 - 97)],
        [30, 97 + (18 / 20) * ((364 * 2) / 20 - 97)],
        /* 11 */ [32, (364 * 2) / 20],
        [34, (364 * 2) / 20 + (2 / 20) * ((406 * 2) / 20 - (364 * 2) / 20)],
        [36, (364 * 2) / 20 + (4 / 20) * ((406 * 2) / 20 - (364 * 2) / 20)],
        [38, (364 * 2) / 20 + (6 / 20) * ((406 * 2) / 20 - (364 * 2) / 20)],
        [40, (364 * 2) / 20 + (8 / 20) * ((406 * 2) / 20 - (364 * 2) / 20)],
        [42, (364 * 2) / 20 + (10 / 20) * ((406 * 2) / 20 - (364 * 2) / 20)],
        [44, (364 * 2) / 20 + (12 / 20) * ((406 * 2) / 20 - (364 * 2) / 20)],
        [46, (364 * 2) / 20 + (14 / 20) * ((406 * 2) / 20 - (364 * 2) / 20)],
        [48, (364 * 2) / 20 + (16 / 20) * ((406 * 2) / 20 - (364 * 2) / 20)],
        [50, (364 * 2) / 20 + (18 / 20) * ((406 * 2) / 20 - (364 * 2) / 20)],
        /* 21 */ [52, (406 * 2) / 20],
      ];

      const result = transformToMovingAverage(timeSeries, 3, true);

      expect(result).toStrictEqual<Data>([
        [10, 105],
        [12, (97 + 105) / 2],
        [
          32,
          (interpolatedTimeSeries[11][1] +
            interpolatedTimeSeries[10][1] +
            interpolatedTimeSeries[9][1]) /
            3,
        ],
        [
          52,
          (interpolatedTimeSeries[21][1] +
            interpolatedTimeSeries[20][1] +
            interpolatedTimeSeries[19][1]) /
            3,
        ],
      ]);

      expect(result).toMatchInlineSnapshot(`
        Array [
          Array [
            10,
            105,
          ],
          Array [
            12,
            101,
          ],
          Array [
            32,
            42.46,
          ],
          Array [
            52,
            40.18,
          ],
        ]
      `);
    });
  });
});
