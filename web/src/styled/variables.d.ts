import { ErrorLevel } from '~client/constants/error';
import { Page, Aggregate } from '~client/types';

export const breakpoints: {
  mobileSmall: number;
  mobile: number;
  tabletSmall: number;
  tablet: number;
  desktop: number;
};

export const itemHeightDesktop: number;
export const itemHeightDesktopFunds: number;
export const itemHeightMobile: number;
export const graphOverviewHeightMobile: number;
export const graphFundsHeightMobile: number;

export const downArrow: string;
export const upArrow: string;
export const downArrowStrong: string;
export const upArrowStrong: string;

export const colorDark: string;
export const colorLight: string;

type ColorsBase = {
  [key: string]: string;
};

type PageColors = ColorsBase & {
  main: string;
};

type Colors = ColorsBase & {
  white: string;
  black: string;
  transparent: string;
  button: ColorsBase;
  messages: Record<ErrorLevel, string>;
  [Page.overview]: PageColors & {
    income: string;
    spending: string;
  };
  [Page.analysis]: PageColors;
  [Page.funds]: PageColors & {
    profit: string;
    loss: string;
    fundUp: string;
    fundDown: string;
  };
  [Page.income]: PageColors;
  [Page.bills]: PageColors;
  [Page.food]: PageColors;
  [Page.general]: PageColors;
  [Page.holiday]: PageColors;
  [Page.social]: PageColors;
  netWorth: PageColors & {
    aggregate: {
      [key in Aggregate]: string;
    };
  };
  blockIndex: string[];
  blockColor: ColorsBase;
};

export const colors: Colors;

export const sizes: {
  heightHeaderMobile: number;
  heightNavMobile: number;
  navbarHeight: number;
  navbarHeightMobile: number;
  logo: number;
};