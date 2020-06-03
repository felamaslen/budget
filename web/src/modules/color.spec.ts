import { rgb, rgba } from 'polished';

import { rgba as rgba__deprecated, getOverviewScoreColor, colorKey, averageColor } from './color';

describe('color module', () => {
  describe('rgba', () => {
    it('should return rgba for four values', () => {
      expect.assertions(1);
      expect(rgba__deprecated([254, 19, 99, 0.4])).toBe('rgba(254,19,99,0.4)');
    });

    it('should return rgb for three values', () => {
      expect.assertions(1);
      expect(rgba__deprecated([0, 92, 29])).toBe('rgb(0,92,29)');
    });
  });

  describe('getOverviewScoreColor', () => {
    describe.each`
      case                                      | value | range
      ${'the range is zero'}                    | ${10} | ${{ min: 1, max: 1 }}
      ${'the value is zero and range zero > 0'} | ${0}  | ${{ min: 1, max: 1 }}
      ${'the value is zero and range positive'} | ${0}  | ${{ min: 0, max: 1 }}
      ${'the value is zero and range zero < 0'} | ${0}  | ${{ min: -1, max: 1 }}
    `('if $case', ({ value, range }) => {
      it('should return white', () => {
        expect.assertions(1);
        expect(getOverviewScoreColor(value, range)).toBe(rgb(255, 255, 255));
      });
    });

    it('should return white if the (positive) value is less than the minimum', () => {
      expect.assertions(2);
      expect(getOverviewScoreColor(1, { min: 3, max: 10 }, { positive: 7 }, rgb(36, 106, 43))).toBe(
        rgb(255, 255, 255),
      );

      expect(
        getOverviewScoreColor(-2, { min: 3, max: 10 }, { positive: 7 }, rgb(36, 106, 43)),
      ).toBe(rgb(255, 255, 255));
    });

    it('should return white if the (negative) value is greater than the maximum', () => {
      expect.assertions(2);
      expect(
        getOverviewScoreColor(-1, { min: -3, max: -10 }, { negative: -7 }, rgb(36, 106, 43)),
      ).toBe(rgb(255, 255, 255));

      expect(
        getOverviewScoreColor(3.1, { min: -3, max: -10 }, { negative: -7 }, rgb(36, 106, 43)),
      ).toBe(rgb(255, 255, 255));
    });

    it('should get the correct color', () => {
      expect.assertions(2);
      expect(
        getOverviewScoreColor(
          10,
          { min: -10, max: 20 },
          { negative: -4, positive: 8 },
          rgb(160, 44, 92),
        ),
      ).toBe(rgb(200, 132, 160));

      expect(
        getOverviewScoreColor(
          -9.4,
          { min: -10, max: 20 },
          { negative: -4, positive: 8 },
          { negative: rgb(160, 44, 92), positive: rgb(9, 119, 203) },
        ),
      ).toBe(rgb(165, 55, 100));
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

    const color = { negative: rgb(36, 230, 105), positive: rgb(10, 51, 210) };

    it.each`
      case                            | score  | expectedColor
      ${'negative below lower bound'} | ${-11} | ${rgb(36, 230, 105)}
      ${'negative minimum'}           | ${-10} | ${rgb(36, 230, 105)}
      ${'negative median'}            | ${-6}  | ${rgb(146, 243, 180)}
      ${'negative maximum'}           | ${-3}  | ${rgb(255, 255, 255)}
      ${'negative above upper bound'} | ${-1}  | ${rgb(255, 255, 255)}
      ${'zero'}                       | ${0}   | ${rgb(255, 255, 255)}
      ${'positive below lower bound'} | ${3}   | ${rgb(255, 255, 255)}
      ${'positive minimum'}           | ${4}   | ${rgb(255, 255, 255)}
      ${'positive median'}            | ${5.5} | ${rgb(133, 153, 233)}
      ${'positive maximum'}           | ${11}  | ${rgb(10, 51, 210)}
      ${'positive above upper bound'} | ${13}  | ${rgb(10, 51, 210)}
    `(
      'should separate non-zero-bound ranges when the score is $case',
      ({ score, expectedColor }) => {
        expect.assertions(1);
        expect(getOverviewScoreColor(score, range, median, color)).toBe(expectedColor);
      },
    );
  });

  describe('colorKey', () => {
    it('should return a colour from a string', () => {
      expect.assertions(1);
      expect(colorKey('foo')).toMatchInlineSnapshot(`"#429900"`);
    });

    it('should return different colours for different strings', () => {
      expect.assertions(1);
      expect(colorKey('foo')).not.toBe(colorKey('bar'));
    });
  });

  describe('averageColor', () => {
    it('should return an average colour', () => {
      expect.assertions(1);
      expect(
        averageColor([rgb(123, 245, 3), rgb(255, 2, 30), rgb(39, 128, 255)]),
      ).toMatchInlineSnapshot(`"#8b7d60"`);
    });

    it('should return transparent by default', () => {
      expect.assertions(1);
      expect(averageColor([])).toBe(rgba(255, 255, 255, 0));
    });
  });
});
