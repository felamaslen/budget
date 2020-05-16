import { rgb, rgba } from 'polished';

import { ERROR_LEVEL_DEBUG, ERROR_LEVEL_WARN, ERROR_LEVEL_ERROR } from '~client/constants/error';

export const breakpoints = {
  mobileSmall: 350,
  mobile: 690,
  tabletSmall: 1000,
  tablet: 1200,
};

export const itemHeightDesktop = 24;
export const itemHeightDesktopFunds = 48;
export const itemHeightMobile = 30;
export const graphOverviewHeightMobile = 240;
export const graphFundsHeightMobile = 125;

export const downArrow = "'\\2198'";
export const upArrow = "'\\2197'";

export const downArrowStrong = "'\\2b0a'";
export const upArrowStrong = "'\\2b08'";

const colorDark = rgb(34, 34, 34);
const colorLight = rgb(234, 234, 234);

export const colors = {
  primary: rgb(216, 77, 77),
  primaryDark: rgb(159, 48, 48),
  primaryMobile: rgb(255, 254, 247),
  primaryDarkMobile: rgb(159, 48, 48),
  green: rgb(0, 153, 51),
  amber: rgb(251, 224, 127),
  accent: rgb(255, 160, 64),
  error: rgb(153, 0, 0),
  delete: rgb(204, 0, 0),
  dark: colorDark,
  'very-dark': rgb(17, 17, 17),
  'very-dark-1': rgb(24, 24, 24),
  'medium-very-light': rgb(153, 153, 153),
  'medium-light': rgb(134, 134, 134),
  medium: rgb(115, 115, 115),
  'medium-slightly-dark': rgb(102, 102, 102),
  'medium-dark-1': rgb(85, 85, 85),
  'slightly-dark': rgb(51, 51, 51),
  light: colorLight,
  'slightly-light': rgb(204, 204, 204),
  'very-light': rgb(254, 254, 254),
  'shadow-l05': rgba(0, 0, 0, 0.05),
  'shadow-l2': rgba(0, 0, 0, 0.2),
  'shadow-l3': rgba(0, 0, 0, 0.3),
  'shadow-l4': rgba(0, 0, 0, 0.4),
  'shadow-l5': rgba(0, 0, 0, 0.5),
  'shadow-l6': rgba(0, 0, 0, 0.6),
  'shadow-l8': rgba(0, 0, 0, 0.8),
  'translucent-dark': rgba(220, 220, 220, 0.4),
  'translucent-l15': rgba(255, 255, 255, 0.15),
  'translucent-l1': rgba(255, 255, 255, 0.1),
  'translucent-l2': rgba(255, 255, 255, 0.2),
  'translucent-l6': rgba(255, 255, 255, 0.6),
  'translucent-l7': rgba(255, 255, 255, 0.7),
  'translucent-l8': rgba(255, 255, 255, 0.8),
  'translucent-l95': rgba(255, 255, 255, 0.95),
  highlight: rgba(255, 255, 0, 0.85),
  'highlight-light': rgb(255, 252, 218),
  white: rgb(255, 255, 255),
  black: rgb(0, 0, 0),
  blue: rgb(0, 153, 238),
  profit: rgb(72, 59, 228),
  'profit-light': rgb(204, 255, 213),
  'profit-translucent': rgba(100, 255, 100, 0.7),
  loss: rgb(255, 44, 44),
  'loss-light': rgb(255, 167, 167),
  'loss-translucent': rgba(255, 100, 100, 0.7),
  'editable-highlight': rgb(255, 140, 0),
  'bg-up': rgb(85, 232, 54),
  'bg-up-hl': rgb(18, 45, 12),
  'bg-up-rev': rgb(51, 44, 44),
  'bg-down': rgb(255, 23, 23),
  'bg-down-hl': rgb(47, 15, 15),
  'bg-down-rev': rgb(44, 51, 45),
  messages: {
    [ERROR_LEVEL_DEBUG]: rgba(0, 156, 255, 0.5),
    [ERROR_LEVEL_WARN]: rgba(255, 147, 0, 0.5),
    [ERROR_LEVEL_ERROR]: rgba(255, 0, 0, 0.5),
    fatal: rgba(128, 0, 0, 0.7),
  },
  button: {
    bg1: rgb(116, 173, 90),
    bg2: rgb(104, 165, 75),
    border: rgb(59, 110, 34),
    active: rgb(105, 154, 83),
    mobile: rgb(255, 163, 92),
    disabled: rgb(156, 156, 156),
  },
  overview: {
    main: rgb(66, 66, 66),
    monthMobile: rgb(255, 252, 163),
    incomeMobile: rgb(183, 255, 163),
    spendingMobile: rgb(255, 163, 163),
    netWorthMobile: rgb(163, 186, 255),
  },
  netWorth: {
    date: rgb(238, 238, 239),
    assets: rgb(216, 233, 211),
    liabilities: rgb(245, 202, 203),
    main: rgb(178, 166, 211),
    expenses: rgb(213, 164, 187),
    aggregate: {
      'Cash (easy access)': rgb(180, 214, 169),
      'Cash (other)': rgb(145, 194, 129),
      Stocks: rgb(159, 195, 199),
      Pension: rgb(47, 123, 211),
    },
  },
  funds: {
    main: rgb(84, 110, 122),
    light: rgb(194, 221, 234),
  },
  income: {
    main: rgb(216, 67, 21),
  },
  bills: {
    main: rgb(183, 28, 28),
  },
  food: {
    main: rgb(67, 160, 71),
  },
  general: {
    main: rgb(1, 87, 155),
    light: rgb(170, 200, 224),
  },
  holiday: {
    main: rgb(0, 137, 123),
  },
  social: {
    main: rgb(191, 158, 36),
  },
  analysis: {
    main: rgb(244, 167, 66),
    statusBg: colorDark,
    status: colorLight,
  },
  blockIndex: [
    rgb(211, 84, 0),
    rgb(26, 188, 156),
    rgb(241, 196, 15),
    rgb(41, 128, 185),
    rgb(39, 174, 96),
    rgb(231, 76, 60),
    rgb(155, 89, 182),
    rgb(247, 0, 0),
    rgb(242, 6, 255),
    rgb(41, 175, 214),
    rgb(74, 149, 134),
    rgb(185, 38, 79),
    rgb(194, 126, 58),
    rgb(157, 157, 0),
    rgb(117, 180, 255),
    rgb(147, 191, 150),
  ],
  blockColor: {
    saved: rgb(17, 56, 34),
  },
};

const heightHeaderMobile = 55;
const heightNavMobile = 36;

export const sizes = {
  heightHeaderMobile,
  heightNavMobile,
  navbarHeight: 49,
  navbarHeightMobile: heightHeaderMobile + heightNavMobile,
  logo: 30,
};
