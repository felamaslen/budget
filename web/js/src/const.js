/**
 * Configurable constants
 */

export const E_NO_STORAGE = "Your browser does not support HTML5 storage, so logins won't be remembered.";

export const MSG_TIME_DEBUG  = 0;
export const MSG_TIME_WARN   = 2000;
export const MSG_TIME_ERROR  = 5000;
export const MSG_TIME_FATAL  = 0;

export const MIN_MSG_LEVEL  = 1;

export const PIE_LABEL_RADIUS_START = 1.1;
export const PIE_LABEL_RADIUS_SCALE = 1.2;
export const PIE_LABEL_INSIDE_RADIUS = 0.6;
export const PIE_LABEL_SWITCH_POINT = 0.65;
export const PIE_LABEL_SCALE_FACTOR_PRE = 0.4;
export const PIE_LABEL_SCALE_FACTOR_POST = 1.2;
export const PIE_SMALL_LABEL_OFFSET = 10;
export const PIE_DEPTH = 10;

export const NAV_HANDLE_EVENT = "click";

export const SEARCH_SUGGESTION_THROTTLE_TIME = 250;

export const ANALYSIS_VIEW_WIDTH   = 500;
export const ANALYSIS_VIEW_HEIGHT  = 500;

export const DO_STOCKS_LIST = true;

export const GRAPH_FUNDS_PIE_WIDTH = 500;
export const GRAPH_FUND_ITEM_LINE_WIDTH = 1.5;
export const GRAPH_FUND_ITEM_TENSION = 0.85;
export const GRAPH_FUND_HISTORY_WIDTH = 500;
export const GRAPH_FUND_HISTORY_WIDTH_NARROW = 400;
export const GRAPH_FUND_HISTORY_TENSION = 0.65;
export const GRAPH_FUND_HISTORY_NUM_TICKS = 10;
export const GRAPH_FUND_HISTORY_LINE_WIDTH = 2;
export const GRAPH_FUND_HISTORY_POINT_RADIUS = 3;

export const GRAPH_BALANCE_NUM_TICKS = 5;

export const GRAPH_KEY_SIZE = 12;
export const GRAPH_KEY_OFFSET_X = 5;
export const GRAPH_KEY_OFFSET_Y = 34;

export const COLOR_GRAPH_TITLE = "#000";
export const COLOR_DARK = "#333";
export const COLOR_LIGHT = "#eee";
export const COLOR_LIGHT_GREY = "#999";

export const COLOR_PROFIT = "#0c3";
export const COLOR_LOSS = "#c30";
export const COLOR_PROFIT_LIGHT = "#94efa0";
export const COLOR_LOSS_LIGHT = "#ffd1d1";

export const COLOR_BALANCE_ACTUAL = "#039";
export const COLOR_BALANCE_PREDICTED = "#f00";

export const COLOR_GRAPH_FUND_ITEM = "#4286f4";
export const COLOR_GRAPH_FUND_LINE = "#164187";
export const COLOR_GRAPH_FUND_POINT = "#0e58ce";

export const COLOR_CATEGORY = {
  funds:  [84, 110, 122],
  bills: [183, 28, 28],
  food: [67, 160, 71],
  general: [1, 87, 155],
  holiday: [0, 137, 123],
  social: [191, 158, 36],
  in: [36, 191, 55],
  out: [191, 36, 36],
  net: [[36, 191, 55], [191, 36, 36]],
  predicted: [36, 191, 55],
  balance: [36, 191, 55]
};

export const COLOR_PIE_L1 = "#f15854";
export const COLOR_PIE_L2 = "#decf3f";
export const COLOR_PIE_L3 = "#b276b2";
export const COLOR_PIE_M1 = "#b2912f";
export const COLOR_PIE_M2 = "#f17cb0";
export const COLOR_PIE_M3 = "#60bd68";
export const COLOR_PIE_S1 = "#faa43a";
export const COLOR_PIE_S2 = "#5da5da";

export const FONT_AXIS_LABEL = "12px Arial, Helvetica, sans-serif";
export const FONT_GRAPH_TITLE = "16px bold Arial, Helvetica, sans-serif";
export const FONT_GRAPH_TITLE_LARGE = "18px bold Arial, Helvetica, sans-serif";
export const FONT_GRAPH_KEY = "13px Arial, Helvetica, sans-serif";
export const FONT_GRAPH_KEY_SMALL = "11px Arial, Helvetica, sans-serif";

export const STOCKS_REFRESH_INTERVAL = 6000;
export const STOCKS_HL_TIME = 7000;
export const STOCKS_LIST_WIDTH = 300;

export const STOCK_INDICES = {
  "INDEXFTSE:UKX": "FTSE100",
  "INDEXFTSE:SMX": "FTSE Small",
  "INDEXSTOXX:SX5E": "ES50",
  "INDEXSP:SPE350": "S&PE350",
  "INDEXHANGSENG:HSI": "HangSeng"
};

