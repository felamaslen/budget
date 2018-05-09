import { List as list, Map as map } from 'immutable';

import { GRAPH_FUNDS_MODE_ROI, GRAPH_FUNDS_PERIODS } from './constants/graph';

function getDefaultFundPeriod() {
    if (process.env.DEFAULT_FUND_PERIOD && GRAPH_FUNDS_PERIODS
        .map(([shortPeriod]) => shortPeriod)
        .includes(process.env.DEFAULT_FUND_PERIOD)
    ) {
        return process.env.DEFAULT_FUND_PERIOD;
    }

    return GRAPH_FUNDS_PERIODS[0][0];
}

export function resetAppState(state) {
    return state
        .set('user', map({ uid: 0, name: null, apiKey: null }))
        .set('pages', map.of())
        .set('currentPage', null)
        .set('pagesRaw', map.of())
        .set('pagesLoaded', map.of())
        .set('edit', map({
            active: map({
                row: 0,
                col: -1,
                page: null,
                id: null,
                item: null,
                value: null,
                originalValue: null
            }),
            add: map.of(),
            addFields: null,
            addFieldsString: null,
            addBtnFocus: false,
            queue: list.of(),
            queueDelete: list.of(),
            requestList: list.of()
        }))
        .set('editSuggestions', map({
            loading: false,
            reqId: null,
            list: list.of(),
            nextCategory: list.of(),
            active: -1
        }))
        .set('modalDialog', map({
            active: false,
            visible: true,
            loading: false,
            type: null,
            row: null,
            id: null,
            fields: list.of(),
            fieldsValidated: list.of(),
            fieldsString: null,
            invalidKeys: list.of()
        }))
        .set('other', map({
            windowWidth: window.innerWidth,
            showAllBalanceGraph: false,
            blockView: map({
                status: '',
                loadKey: null,
                blocks: null,
                active: null,
                deep: null
            }),
            analysis: map({
                loading: false,
                period: 0,
                grouping: 0,
                timeIndex: 0,
                timeline: null,
                treeOpen: map.of(),
                treeVisible: map({ bills: false })
            }),
            graphFunds: map({
                period: getDefaultFundPeriod(),
                mode: GRAPH_FUNDS_MODE_ROI,
                showOverall: true,
                zoom: list([null, null]), // range to restrict to
                range: list([null, null]), // possible range
                startTime: 0,
                cacheTimes: list.of()
            }),
            stocksList: map({
                loadedList: false,
                loadedInitial: false,
                lastPriceUpdate: -1,
                loading: false,
                apiKey: '',
                stocks: map.of(),
                indices: map.of(),
                weightedGain: 0,
                oldWeightedGain: 0,
                history: list.of()
            }),
            fundsCachedValue: map({ ageText: null, value: null }),
            fundHistoryCache: map.of()
        }))
        .set('loginForm', map({
            inputStep: 0,
            values: list.of(),
            visible: false,
            active: true
        }));
}

// the state of the app (reduction) is stored as an immutable object,
// and returned (modified) by reducers
export default resetAppState(map({
    errorMsg: list.of(),
    loading: false, // for big (disruptive) things like loading pages
    loadingApi: false // for small things like edit updates
}));

