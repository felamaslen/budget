import { rgb } from 'polished';

import { colorKey, getOverviewCategoryColor, getOverviewScoreColor } from '~/modules/color';

test('colorKey returns different colours for different strings', () => {
  expect(colorKey('foo')).not.toEqual(colorKey('bar'));

  expect(colorKey('Scottish Mortgage IT Ordinary Shares 5p (share)')).toBe(rgb(31, 0, 153));
});

test('getOverviewCategoryColor returns the correct colour list', () => {
  expect(getOverviewCategoryColor()).toStrictEqual({
    funds: rgb(84, 110, 122),
    bills: rgb(183, 28, 28),
    food: rgb(67, 160, 71),
    general: rgb(1, 87, 155),
    holiday: rgb(0, 137, 123),
    social: rgb(191, 158, 36),
    income: rgb(36, 191, 55),
    spending: rgb(191, 36, 36),
    net: [rgb(191, 36, 36), rgb(36, 191, 55)],
    netWorthPredicted: [rgb(191, 36, 36), rgb(36, 191, 55)],
    netWorth: [rgb(191, 36, 36), rgb(36, 191, 55)],
  });
});

test('getOverviewScoreColor returns white if the range is zero', () => {
  expect(getOverviewScoreColor(10, { min: 1, max: 1 }, {}, '')).toBe(rgb(255, 255, 255));
});

test('getOverviewScoreColor returns white if the value is zero', () => {
  expect(getOverviewScoreColor(0, { min: 1, max: 1 }, {}, '')).toBe(rgb(255, 255, 255));
  expect(getOverviewScoreColor(0, { min: 0, max: 1 }, {}, '')).toBe(rgb(255, 255, 255));
  expect(getOverviewScoreColor(0, { min: -1, max: 1 }, {}, '')).toBe(rgb(255, 255, 255));
});

test('getOverviewScoreColor returns white if the (positive) value is less than the minimum', () => {
  expect(getOverviewScoreColor(1, { min: 3, max: 10 }, { positive: 7 }, rgb(36, 106, 43))).toBe(
    rgb(255, 255, 255),
  );

  expect(getOverviewScoreColor(-2, { min: 3, max: 10 }, { positive: 7 }, rgb(36, 106, 43))).toBe(
    rgb(255, 255, 255),
  );
});

test('getOverviewScoreColor returns white if the (negative) value is greater than the maximum', () => {
  expect(getOverviewScoreColor(-1, { min: -3, max: -10 }, { negative: -7 }, rgb(36, 106, 43))).toBe(
    rgb(255, 255, 255),
  );

  expect(
    getOverviewScoreColor(3.1, { min: -3, max: -10 }, { negative: -7 }, rgb(36, 106, 43)),
  ).toBe(rgb(255, 255, 255));
});

test('getOverviewScoreColor gets the correct color', () => {
  expect(
    getOverviewScoreColor(
      10,
      { min: -10, max: 20 },
      { negative: -4, positive: 8 },
      rgb(160, 44, 92),
    ),
  ).toBe(rgb(199, 131, 159));

  expect(
    getOverviewScoreColor(-9.4, { min: -10, max: 20 }, { negative: -4, positive: 8 }, [
      rgb(160, 44, 92),
      rgb(9, 119, 203),
    ]),
  ).toBe(rgb(164, 54, 100));
});

const range = {
  min: -10,
  minNegative: -3,
  maxPositive: 4,
  max: 11,
};

const median = {
  negative: -6,
  positive: 5.5,
};

const color: [string, string] = [rgb(36, 230, 105), rgb(10, 51, 210)];

test('getOverviewScoreColor separate non-zero-bound ranges: negative below lower bound', () => {
  expect(getOverviewScoreColor(-11, range, median, color)).toBe(rgb(36, 230, 105));
});

test('getOverviewScoreColor separate non-zero-bound ranges: negative minimum', () => {
  expect(getOverviewScoreColor(-10, range, median, color)).toBe(rgb(36, 230, 105));
});

test('getOverviewScoreColor separate non-zero-bound ranges: negative median', () => {
  expect(getOverviewScoreColor(-6, range, median, color)).toBe(rgb(145, 242, 180));
});

test('getOverviewScoreColor separate non-zero-bound ranges: negative maximum', () => {
  expect(getOverviewScoreColor(-3, range, median, color)).toBe(rgb(255, 255, 255));
});

test('getOverviewScoreColor separate non-zero-bound ranges: negative above upper bound', () => {
  expect(getOverviewScoreColor(-1, range, median, color)).toBe(rgb(255, 255, 255));
});

test('getOverviewScoreColor separate non-zero-bound ranges: zero', () => {
  expect(getOverviewScoreColor(0, range, median, color)).toBe(rgb(255, 255, 255));
});

test('getOverviewScoreColor separate non-zero-bound ranges: positive below lower bound', () => {
  expect(getOverviewScoreColor(3, range, median, color)).toBe(rgb(255, 255, 255));
});

test('getOverviewScoreColor separate non-zero-bound ranges: positive minimum', () => {
  expect(getOverviewScoreColor(4, range, median, color)).toBe(rgb(255, 255, 255));
});

test('getOverviewScoreColor separate non-zero-bound ranges: positive median', () => {
  expect(getOverviewScoreColor(5.5, range, median, color)).toBe(rgb(132, 153, 232));
});

test('getOverviewScoreColor separate non-zero-bound ranges: positive maximum', () => {
  expect(getOverviewScoreColor(11, range, median, color)).toBe(rgb(10, 51, 210));
});

test('getOverviewScoreColor separate non-zero-bound ranges: positive above upper bound', () => {
  expect(getOverviewScoreColor(13, range, median, color)).toBe(rgb(10, 51, 210));
});
