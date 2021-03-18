import { compose } from '@typed/compose';
import { rgb, rgba, lighten, desaturate } from 'polished';

import { ErrorLevel } from '~client/constants/error';
import { Aggregate } from '~client/types/enum';

export const breakpoints = {
  mobileSmall: 350,
  mobile: 500,
  tabletSmall: 880,
  tablet: 1200,
  desktop: 1325,
};

export const graphOverviewHeightMobile = 240;
export const graphFundsHeightMobile = 125;

export const downArrow = "'\\2198'";
export const upArrow = "'\\2197'";

export const downArrowStrong = "'\\2b0a'";
export const upArrowStrong = "'\\2b08'";

const colorStocks = rgb(84, 110, 122);

export const colors = {
  primary: rgb(216, 77, 77),
  primaryDark: rgb(159, 48, 48),
  primaryMobile: rgb(255, 254, 247),
  primaryDarkMobile: rgb(159, 48, 48),
  white: rgb(255, 255, 255),
  light: {
    light: rgb(254, 254, 254),
    mediumLight: rgb(234, 234, 234),
    mediumDark: rgb(204, 204, 204),
    dark: rgb(153, 153, 153),
  },
  medium: {
    light: rgb(134, 134, 134),
    mediumLight: rgb(115, 115, 115),
    mediumDark: rgb(102, 102, 102),
    dark: rgb(85, 85, 85),
  },
  dark: {
    light: rgb(51, 51, 51),
    mediumLight: rgb(34, 34, 34),
    mediumDark: rgb(24, 24, 24),
    dark: rgb(17, 17, 17),
  },
  black: rgb(0, 0, 0),
  shadow: {
    light: rgba(0, 0, 0, 0.2),
    mediumLight: rgba(0, 0, 0, 0.4),
    mediumDark: rgba(0, 0, 0, 0.6),
    dark: rgba(0, 0, 0, 0.8),
  },
  translucent: {
    light: {
      light: rgba(255, 255, 255, 0.95),
      mediumLight: rgba(255, 255, 255, 0.8),
      mediumDark: rgba(255, 255, 255, 0.7),
      dark: rgba(255, 255, 255, 0.6),
    },
    dark: {
      light: rgba(255, 255, 255, 0.2),
      mediumLight: rgba(255, 255, 255, 0.1),
      mediumDark: rgba(255, 255, 255, 0.15),
      dark: rgba(220, 220, 220, 0.4),
    },
  },
  transparent: rgba(255, 255, 255, 0),
  green: rgb(0, 153, 51),
  amber: rgb(251, 224, 127),
  accent: rgb(255, 160, 64),
  error: rgb(153, 0, 0),
  create: rgb(0, 153, 24),
  delete: rgb(204, 0, 0),
  highlight: {
    dark: rgba(255, 255, 0, 0.4),
    light: rgb(255, 252, 218),
  },
  blue: rgb(0, 153, 238),
  profit: {
    dark: rgb(72, 59, 228),
    light: rgb(204, 255, 213),
    translucent: rgba(100, 255, 100, 0.7),
  },
  loss: {
    dark: rgb(255, 44, 44),
    light: rgb(255, 167, 167),
    translucent: rgba(255, 100, 100, 0.7),
  },
  'bg-up': rgb(85, 232, 54),
  'bg-up-hl': rgb(18, 45, 12),
  'bg-up-rev': rgb(51, 44, 44),
  'bg-down': rgb(255, 23, 23),
  'bg-down-hl': rgb(47, 15, 15),
  'bg-down-rev': rgb(44, 51, 45),
  messages: {
    [ErrorLevel.Debug]: rgba(0, 156, 255, 0.5),
    [ErrorLevel.Warn]: rgba(255, 147, 0, 0.5),
    [ErrorLevel.Err]: rgba(255, 0, 0, 0.5),
    [ErrorLevel.Fatal]: rgba(128, 0, 0, 0.7),
  },
  button: {
    main: rgb(116, 173, 90),
    focus: rgb(128, 190, 105),
    border: rgb(59, 110, 34),
    active: rgb(99, 140, 77),
    mobile: rgb(255, 163, 92),
    disabled: rgb(156, 156, 156),
  },
  overview: {
    main: rgb(66, 66, 66),
    income: rgb(36, 191, 55),
    incomeMobile: rgb(183, 255, 163),
    spending: rgb(191, 36, 36),
    monthMobile: rgb(255, 252, 163),
    spendingMobile: rgb(255, 163, 163),
    netWorthMobile: rgb(163, 186, 255),
    balanceActual: rgb(0, 51, 153),
    balancePredicted: compose(lighten(0.2), desaturate(1))(rgb(0, 51, 153)),
    balanceStocks: rgba(200, 200, 200, 0.5),
    balanceLockedCash: compose(lighten(0.3), desaturate(0.9))(rgb(0, 255, 0)),
  },
  netWorth: {
    date: rgb(238, 238, 239),
    assets: rgb(216, 233, 211),
    liabilities: rgb(245, 202, 203),
    main: rgb(178, 166, 211),
    expenses: rgb(213, 164, 187),
    options: rgb(90, 168, 190),
    homeEquity: rgb(150, 140, 39),
    aggregate: {
      [Aggregate.cashEasyAccess]: rgb(180, 214, 169),
      [Aggregate.cashOther]: rgb(145, 194, 129),
      [Aggregate.stocks]: lighten(0.3)(colorStocks),
      [Aggregate.pension]: rgb(47, 123, 211),
      [Aggregate.realEstate]: rgb(122, 180, 99),
      [Aggregate.mortgage]: rgb(180, 99, 122),
    },
  },
  funds: {
    main: colorStocks,
    profit: rgb(0, 204, 51),
    loss: rgb(204, 51, 0),
    fundUp: rgb(0, 230, 18),
    fundDown: rgb(255, 44, 44),
  },
  income: {
    main: rgb(67, 216, 21),
  },
  bills: {
    main: rgb(183, 28, 28),
  },
  food: {
    main: rgb(67, 160, 71),
  },
  general: {
    main: rgb(1, 87, 155),
  },
  holiday: {
    main: rgb(0, 137, 123),
  },
  social: {
    main: rgb(191, 158, 36),
  },
  analysis: {
    main: rgb(244, 167, 66),
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

const heightHeaderMobile = 32;
const heightNavMobile = 36;

export const sizes = {
  heightHeaderMobile,
  heightNavMobile,
  navbarHeight: 49,
  navbarHeightMobile: heightHeaderMobile + heightNavMobile,
  logo: 28,
};
