import { separateLines, formatValue } from './funds';
import { Mode } from '~client/constants/graph';
import { Data } from '~client/types';

describe('funds module', () => {
  describe('separateLines', () => {
    it('should separate a list of data into separate lines', () => {
      expect.assertions(1);
      const line: Data = [
        [0, 10],
        [1, 11],
        [2, 10.5],
        [3, 0],
        [4, 0],
        [5, 9.4],
        [6, 9.8],
        [7, 10.3],
        [8, 0],
        [9, 15.1],
        [10, 14.9],
      ];

      const result = separateLines(line);

      expect(result).toStrictEqual([
        [
          [0, 10],
          [1, 11],
          [2, 10.5],
        ],
        [
          [5, 9.4],
          [6, 9.8],
          [7, 10.3],
        ],
        [
          [9, 15.1],
          [10, 14.9],
        ],
      ]);
    });
  });

  describe('formatValue', () => {
    it('should return a percentage if the mode is ROI', () => {
      expect.assertions(1);
      expect(formatValue(13.2984, Mode.ROI)).toBe('13.30%');
    });

    it('should return a currency value if the mode is not ROI', () => {
      expect.assertions(2);
      expect(formatValue(931239, Mode.Value)).toBe('£9.3k');
      expect(formatValue(491, Mode.Price)).toBe('£4.91');
    });
  });
});
