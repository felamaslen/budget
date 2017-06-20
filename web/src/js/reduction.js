import { Record, List, fromJS } from 'immutable';

import {
  PAGES, SERVER_UPDATE_IDLE,
  GRAPH_FUNDS_MODE_ROI
} from './misc/const';

// the state of the app (reduction) is stored as an immutable object,
// and returned (modified) by reducers
export default new Record({
  appState: fromJS({
    errorMsg: [],
    loading: false, // for big (disruptive) things like loading pages
    loadingApi: false, // for small things like edit updates
    user: {
      uid: 0,
      name: null,
      apiKey: null
    },
    loginForm: {
      inputStep: 0,
      values: [],
      loading: false,
      loadedCookie: false
    },
    pages: PAGES.map(() => null),
    pagesRaw: PAGES.map(() => null),
    pagesLoaded: PAGES.map(() => false),
    currentPageIndex: -1,
    edit: {
      active: {
        row: 0,
        col: -1,
        pageIndex: null,
        id: null,
        item: null,
        value: null,
        originalValue: null
      },
      add: [],
      addBtnFocus: false,
      queue: [],
      queueDelete: [],
      status: SERVER_UPDATE_IDLE
    },
    other: {
      showAllBalanceGraph: false,
      graphFundsMode: GRAPH_FUNDS_MODE_ROI,
      graphFundsShowOverall: true
    }
  }),
  // side effects
  effects: List.of()
});

