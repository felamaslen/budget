import { Record, List, fromJS } from 'immutable';

import { PAGES } from './misc/const';

// the state of the app (reduction) is stored as an immutable object,
// and returned (modified) by reducers
export default new Record({
  appState: fromJS({
    errorMsg: [],
    loading: false,
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
        page: null,
        item: null,
        value: null,
        originalValue: null
      },
      queue: []
    }
  }),
  // side effects
  effects: List.of()
});

