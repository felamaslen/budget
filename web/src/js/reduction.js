import { Record, List as list, Map as map } from 'immutable';

import {
  PAGES, SERVER_UPDATE_IDLE,
  GRAPH_FUNDS_MODE_ROI, GRAPH_FUNDS_PERIODS
} from './misc/const';

export const resetAppState = appState => {
  return appState
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
    status: SERVER_UPDATE_IDLE,
    suggestions: map({
      loading: false,
      reqId: null,
      list: [],
      active: -1
    })
  }))
  .set('other', map({
    showAllBalanceGraph: false,
    analysis: map({
      loading: false,
      period: 0,
      grouping: 0,
      timeIndex: 0,
      treeOpen: map.of(),
      treeVisible: map({ bills: false }),
      deepBlock: null,
      status: null,
      active: null
    }),
    graphFunds: map({
      period: GRAPH_FUNDS_PERIODS[0][0],
      mode: GRAPH_FUNDS_MODE_ROI,
      showOverall: true,
      hlPoint: null,
      zoom: list([null, null]), // range to restrict to
      range: list([null, null]) // possible range
    }),
    stocksList: map({
      loadedInitial: false,
      lastPriceUpdate: -1,
      loading: false,
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
};

// the state of the app (reduction) is stored as an immutable object,
// and returned (modified) by reducers
export default new Record({
  appState: resetAppState(map({
    errorMsg: list.of(),
    loading: false, // for big (disruptive) things like loading pages
    loadingApi: false, // for small things like edit updates
    loginForm: map({
      inputStep: 0,
      values: list.of(),
      loading: false,
      loadedCookie: false
    })
  })),
  // side effects
  effects: list.of()
});

