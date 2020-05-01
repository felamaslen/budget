import {
  rgba,
  getOverviewCategoryColor,
  getOverviewScoreColor,
  colorKey,
  averageColor,
} from './color';
import { Color } from '~client/constants/colors';

describe('color module', () => {
  describe('rgba', () => {
    it('should return rgba for four values', () => {
      expect.assertions(1);
      expect(rgba([254, 19, 99, 0.4])).toBe('rgba(254,19,99,0.4)');
    });

    it('should return rgb for three values', () => {
      expect.assertions(1);
      expect(rgba([0, 92, 29])).toBe('rgb(0,92,29)');
    });
  });

  describe('getOverviewCategoryColor', () => {
    it('should return the correct colour list', () => {
      expect.assertions(1);
      expect(getOverviewCategoryColor()).toStrictEqual({
        funds: [84, 110, 122],
        bills: [183, 28, 28],
        food: [67, 160, 71],
        general: [1, 87, 155],
        holiday: [0, 137, 123],
        social: [191, 158, 36],
        income: [36, 191, 55],
        spending: [191, 36, 36],
        net: [
          [191, 36, 36],
          [36, 191, 55],
        ],
        netWorthPredicted: [
          [191, 36, 36],
          [36, 191, 55],
        ],
        netWorth: [
          [191, 36, 36],
          [36, 191, 55],
        ],
      });
    });
  });

  describe('getOverviewScoreColor', () => {
    it('should return white if the range is zero', () => {
      expect.assertions(1);
      expect(getOverviewScoreColor(10, { min: 1, max: 1 })).toStrictEqual([255, 255, 255]);
    });

    it('should return white if the value is zero', () => {
      expect.assertions(3);
      expect(getOverviewScoreColor(0, { min: 1, max: 1 })).toStrictEqual([255, 255, 255]);
      expect(getOverviewScoreColor(0, { min: 0, max: 1 })).toStrictEqual([255, 255, 255]);
      expect(getOverviewScoreColor(0, { min: -1, max: 1 })).toStrictEqual([255, 255, 255]);
    });

    it('should return white if the (positive) value is less than the minimum', () => {
      expect.assertions(2);
      expect(
        getOverviewScoreColor(1, { min: 3, max: 10 }, { positive: 7 }, [36, 106, 43]),
      ).toStrictEqual([255, 255, 255]);

      expect(
        getOverviewScoreColor(-2, { min: 3, max: 10 }, { positive: 7 }, [36, 106, 43]),
      ).toStrictEqual([255, 255, 255]);
    });

    it('should return white if the (negative) value is greater than the maximum', () => {
      expect.assertions(2);
      expect(
        getOverviewScoreColor(-1, { min: -3, max: -10 }, { negative: -7 }, [36, 106, 43]),
      ).toStrictEqual([255, 255, 255]);

      expect(
        getOverviewScoreColor(3.1, { min: -3, max: -10 }, { negative: -7 }, [36, 106, 43]),
      ).toStrictEqual([255, 255, 255]);
    });

    it('should get the correct color', () => {
      expect.assertions(2);
      expect(
        getOverviewScoreColor(10, { min: -10, max: 20 }, { negative: -4, positive: 8 }, [
          160,
          44,
          92,
        ]),
      ).toStrictEqual([200, 132, 160]);

      expect(
        getOverviewScoreColor(-9.4, { min: -10, max: 20 }, { negative: -4, positive: 8 }, [
          [160, 44, 92],
          [9, 119, 203],
        ]),
      ).toStrictEqual([165, 55, 100]);
    });

    const range = {
      min: -10,
      maxNegative: -3,
      minPositive: 4,
      max: 11,
    };

    const median = {
      negative: -6,
      positive: 5.5,
    };

    const color: [Color, Color] = [
      [36, 230, 105],
      [10, 51, 210],
    ];

    it.each([
      ['negative below lower bound', -11, [36, 230, 105]],
      ['negative minimum', -10, [36, 230, 105]],
      ['negative median', -6, [146, 243, 180]],
      ['negative maximum', -3, [255, 255, 255]],
      ['negative above upper bound', -1, [255, 255, 255]],
      ['zero', 0, [255, 255, 255]],
      ['positive below lower bound', 3, [255, 255, 255]],
      ['positive minimum', 4, [255, 255, 255]],
      ['positive median', 5.5, [133, 153, 233]],
      ['positive maximum', 11, [10, 51, 210]],
      ['positive above upper bound', 13, [10, 51, 210]],
    ])('should separate non-zero-bound ranges: %s', (_, score, expectedColor) => {
      expect.assertions(1);
      expect(getOverviewScoreColor(score, range, median, color)).toStrictEqual(expectedColor);
    });
  });

  describe('colorKey', () => {
    it('should return different colours for other numbers', () => {
      expect.assertions(6);
      expect(Array.isArray(colorKey('foo'))).toBe(true);
      expect(colorKey('foo')).toHaveLength(3);
      expect(colorKey('foo')).not.toStrictEqual([0, 0, 0]);

      expect(Array.isArray(colorKey('bar'))).toBe(true);
      expect(colorKey('bar')).toHaveLength(3);
      expect(colorKey('bar')).not.toStrictEqual(colorKey('foo'));
    });
  });

  describe('averageColor', () => {
    it('should return an average colour', () => {
      expect.assertions(1);
      expect(
        averageColor([
          [123, 245, 3],
          [255, 2, 30],
          [39, 128, 255],
        ]),
      ).toStrictEqual([139, 125, 96]);
    });

    it('should return transparent by default', () => {
      expect.assertions(1);
      expect(averageColor([])).toStrictEqual([255, 255, 255, 0]);
    });
  });
});
