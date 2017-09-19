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

export const aShowAllToggled = () => buildMessage(GRAPH_SHOWALL_TOGGLED);
export const aFundItemGraphToggled = key => buildMessage(GRAPH_FUND_ITEM_TOGGLED, key);
export const aFundsGraphClicked = () => buildMessage(GRAPH_FUNDS_CLICKED);
export const aFundsGraphZoomed = obj => buildMessage(GRAPH_FUNDS_ZOOMED, obj);
export const aFundsGraphHovered = position => buildMessage(GRAPH_FUNDS_HOVERED, position);
export const aFundsGraphLineToggled = index => buildMessage(GRAPH_FUNDS_LINE_TOGGLED, index);
export const aFundsGraphPeriodChanged = (period, noCache, reloadPagePrices) => {
    return buildMessage(GRAPH_FUNDS_PERIOD_CHANGED, {
        period,
        noCache,
        reloadPagePrices
    });
};
export const aFundsPeriodLoaded = response => buildMessage(GRAPH_FUNDS_PERIOD_LOADED, response);

