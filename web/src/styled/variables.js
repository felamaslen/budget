import { rgb, rgba } from 'polished';

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

const colorDark = rgb(34, 34, 34);
const colorLight = rgb(234, 234, 234);

export const colors = {
    dark: colorDark,
    light: colorLight,
    'shadow-l2': rgba(0, 0, 0, 0.2),
    'shadow-l3': rgba(0, 0, 0, 0.3),
    'shadow-l4': rgba(0, 0, 0, 0.4),
    'shadow-l6': rgba(0, 0, 0, 0.6),
    'translucent-l2': rgba(255, 255, 255, 0.2),
    'translucent-l6': rgba(255, 255, 255, 0.6),
    highlight: rgba(255, 255, 0, 0.85),
    overview: {
        main: rgb(66, 66, 66),
    },
    funds: {
        main: rgb(84, 110, 122),
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
