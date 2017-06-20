/**
 * Actions called to manipulate graphs
 */

import buildMessage from '../messageBuilder';
import {
  AC_GRAPH_SHOWALL_TOGGLED, AC_GRAPH_FUND_ITEM_TOGGLED,
  AC_GRAPH_FUNDS_CLICKED
} from '../constants/actions';

export const aShowAllToggled = () => buildMessage(AC_GRAPH_SHOWALL_TOGGLED);
export const aFundItemGraphToggled = key => buildMessage(AC_GRAPH_FUND_ITEM_TOGGLED, key);
export const aFundsGraphClicked = () => buildMessage(AC_GRAPH_FUNDS_CLICKED);

