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

import { getPeriodMatch } from '../misc/data';

import { aErrorOpened } from '../actions/ErrorActions';

import { requestFundPeriodData } from '../effects/content.effects';

export const aShowAllToggled = () => buildMessage(GRAPH_SHOWALL_TOGGLED);
export const aFundItemGraphToggled = key => buildMessage(GRAPH_FUND_ITEM_TOGGLED, key);
export const aFundsGraphClicked = () => buildMessage(GRAPH_FUNDS_CLICKED);
export const aFundsGraphZoomed = obj => buildMessage(GRAPH_FUNDS_ZOOMED, obj);
export const aFundsGraphHovered = position => buildMessage(GRAPH_FUNDS_HOVERED, position);
export const aFundsGraphLineToggled = index => buildMessage(GRAPH_FUNDS_LINE_TOGGLED, index);
export const aFundsGraphPeriodChanged = ({
    apiKey, shortPeriod, noCache, reloadPagePrices, fundHistoryCache
}) => {
    const loadFromCache = !noCache && fundHistoryCache.has(shortPeriod);

    if (loadFromCache) {
        return buildMessage(GRAPH_FUNDS_PERIOD_CHANGED, shortPeriod);
    }

    return async dispatch => {
        const { period, length } = getPeriodMatch(shortPeriod);

        try {
            const response = await requestFundPeriodData({ apiKey, period, length });

            const data = response.data.data;

            dispatch(buildMessage(GRAPH_FUNDS_PERIOD_LOADED, {
                reloadPagePrices,
                shortPeriod,
                data
            }));
        }
        catch (err) {
            dispatch(aErrorOpened('Error loading fund data'));
        }
    };
};

