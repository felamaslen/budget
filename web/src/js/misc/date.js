/**
 * Date functions and classes
 */

export const yearMonthDifference = (ym1, ym2) => {
  return 12 * (ym2[0] - ym1[0]) + ym2[1] - ym1[1];
};

