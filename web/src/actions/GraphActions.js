/**
 * Actions called to manipulate graphs
 */

import buildMessage from '../messageBuilder';
import {
    GRAPH_SHOWALL_TOGGLED, GRAPH_FUND_ITEM_TOGGLED,
    GRAPH_FUNDS_CLICKED, GRAPH_FUNDS_ZOOMED,
    GRAPH_FUNDS_HOVERED, GRAPH_FUNDS_LINE_TOGGLED,
    GRAPH_FUNDS_PERIOD_CHANGED, GRAPH_FUNDS_PERIOD_LOADED
} from '../constants/actions';

import { FUNDS_PERIOD_REQUESTED } from '../constants/effects';

export const aShowAllToggled = () => buildMessage(GRAPH_SHOWALL_TOGGLED);
export const aFundItemGraphToggled = key => buildMessage(GRAPH_FUND_ITEM_TOGGLED, key);
export const aFundsGraphClicked = () => buildMessage(GRAPH_FUNDS_CLICKED);
export const aFundsGraphZoomed = obj => buildMessage(GRAPH_FUNDS_ZOOMED, obj);
export const aFundsGraphHovered = position => buildMessage(GRAPH_FUNDS_HOVERED, position);
export const aFundsGraphLineToggled = index => buildMessage(GRAPH_FUNDS_LINE_TOGGLED, index);
export const aFundsGraphPeriodReceived = res => buildMessage(GRAPH_FUNDS_PERIOD_LOADED, res);
export const aFundsGraphPeriodChanged = req => buildMessage(
    GRAPH_FUNDS_PERIOD_CHANGED, req, FUNDS_PERIOD_REQUESTED
);

