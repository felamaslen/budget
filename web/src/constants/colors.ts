export type Color = [number, number, number, number?];

export const COLOR_CATEGORY: { [category: string]: Color } = {
    funds: [84, 110, 122],
    bills: [183, 28, 28],
    food: [67, 160, 71],
    general: [1, 87, 155],
    holiday: [0, 137, 123],
    social: [191, 158, 36],
    income: [36, 191, 55],
    spending: [191, 36, 36],
};

// fund colour scale
export const COLOR_FUND_DOWN = [255, 44, 44];
export const COLOR_FUND_UP = [0, 230, 18];

// all other colour definitions
export const COLOR_GRAPH_TITLE: Color = [0, 0, 0];
export const COLOR_DARK: Color = [51, 51, 51];
export const COLOR_LIGHT: Color = [238, 238, 238];
export const COLOR_LIGHT_MED: Color = [200, 200, 200];
export const COLOR_LIGHT_GREY: Color = [153, 153, 153];
export const COLOR_TRANSLUCENT_LIGHT: Color = [255, 255, 255, 0.5];
export const COLOR_TRANSLUCENT_DARK: Color = [255, 255, 255, 0.8];

export const COLOR_PROFIT: Color = [0, 204, 51];
export const COLOR_LOSS: Color = [204, 51, 0];

export const COLOR_BALANCE_ACTUAL: Color = [0, 51, 153];
export const COLOR_BALANCE_PREDICTED: Color = [255, 0, 0];
export const COLOR_BALANCE_STOCKS: Color = [200, 200, 200, 0.5];
export const COLOR_SPENDING: Color = [0, 51, 153];

export const COLOR_GRAPH_FUND_LINE: Color = COLOR_GRAPH_TITLE;
