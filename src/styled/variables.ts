import { rgb, rgba } from 'polished';

export const breakpoints = {
  mobileSmall: 350,
  mobile: 690,
  tabletSmall: 1000,
  tablet: 1200,
};

export const sizes: { [key: string]: number } = {
  heightHeader: 48,
  heightNav: 32,
  heightHeaderMobile: 80,
  heightNavMobile: 36,
  logo: 30,
};

const black = rgb(0, 0, 0);

export const colors: { [key: string]: string } = {
  black,
  white: rgb(255, 255, 255),
  primary: rgb(216, 77, 77),
  secondary: rgb(255, 254, 247),
  accent: rgb(255, 160, 64),
  green: rgb(29, 161, 99),
  amber: rgb(251, 224, 127),
  backgroundMediumDark: rgb(85, 85, 85),
  backgroundDark: rgb(17, 17, 17),
  textLight: rgb(254, 254, 254),
  textMedium: rgb(190, 190, 190),
  textDark: rgb(51, 51, 51),
  shadowLight: rgba(0, 0, 0, 0.3),
  shadowMedium: rgba(0, 0, 0, 0.5),
  shadowDark: rgba(0, 0, 0, 0.8),
  overview: rgb(66, 66, 66),
  analysis: rgb(244, 167, 66),
  funds: rgb(84, 110, 122),
  income: rgb(216, 67, 21),
  incomeKey: rgb(36, 191, 55),
  spendingKey: rgb(191, 36, 36),
  bills: rgb(183, 28, 28),
  food: rgb(67, 160, 71),
  general: rgb(1, 87, 155),
  holiday: rgb(0, 137, 123),
  social: rgb(191, 158, 36),
  graphTitle: black,
  graphFundLine: black,
};
