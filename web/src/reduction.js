import { List as list, Map as map } from 'immutable';

import {
    PAGES, GRAPH_FUNDS_MODE_ROI, GRAPH_FUNDS_PERIODS
} from './misc/const';

export function resetAppState(state) {
    return state
        .set('user', map({ uid: 0, name: null, apiKey: null }))
        .set('pages', list(PAGES).map(() => null))
        .set('pagesRaw', list(PAGES).map(() => null))
        .set('pagesLoaded', list(PAGES).map(() => null))
        .set('currentPageIndex', -1)
        .set('edit', map({
            active: map({
                row: 0,
                col: -1,
                pageIndex: null,
                id: null,
                item: null,
                value: null,
                originalValue: null
            }),
            add: list.of(),
            addBtnFocus: false,
            queue: list.of(),
            queueDelete: list.of(),
            requestList: list.of(),
            suggestions: map({
                loading: false,
                reqId: null,
                list: [],
                active: -1
            })
        }))
        .set('modalDialog', map({
            active: false,
            type: null,
            row: null,
            id: null,
            fields: list.of(),
            invalidKeys: list.of()
        }))
        .set('other', map({
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
                treeOpen: map.of(),
                treeVisible: map({ bills: false })
            }),
            graphFunds: map({
                period: GRAPH_FUNDS_PERIODS[0][0],
                mode: GRAPH_FUNDS_MODE_ROI,
                showOverall: true,
                hlPoint: null,
                zoom: list([null, null]), // range to restrict to
                range: list([null, null]), // possible range
                startTime: 0,
                cacheTimes: list.of()
            }),
            stocksList: map({
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
        .setIn(['loginForm', 'values'], list.of());
}

// the state of the app (reduction) is stored as an immutable object,
// and returned (modified) by reducers
export default resetAppState(map({
    errorMsg: list.of(),
    loading: false, // for big (disruptive) things like loading pages
    loadingApi: false, // for small things like edit updates
    loginForm: map({
        inputStep: 0,
        values: list.of(),
        visible: false,
        loadedCookie: false
    })
}));

