/**
 * This is run whenever an action is called by a view, and decides which
 * reducer to run based on the action given.
 */

import {
  AC_ERROR_OPEN,
  AC_ERROR_CLOSE,
  AC_ERROR_REMOVE,
  AC_ERRORS_TIMEDOUT,

  AC_LOGIN_FORM_INPUTTED,
  AC_LOGIN_FORM_RESET,
  AC_LOGIN_FORM_SUBMITTED,
  AC_LOGIN_FORM_RESPONSE_GOT,

  AC_USER_LOGGED_OUT,
  AC_COOKIES_LOADED,
  AC_PAGE_NAVIGATED,
  AC_KEY_PRESSED,
  AC_SERVER_UPDATED,
  AC_SERVER_UPDATE_RECEIVED,
  AC_SERVER_ADD_RECEIVED,

  AC_CONTENT_LOADED,

  AC_EDIT_ACTIVATED,
  AC_EDIT_CHANGED,
  AC_EDIT_LIST_ITEM_ADDED,
  AC_EDIT_LIST_ITEM_DELETED,

  AC_EDIT_FUND_TRANSACTIONS_CHANGED,
  AC_EDIT_FUND_TRANSACTIONS_ADDED,
  AC_EDIT_FUND_TRANSACTIONS_REMOVED,

  AC_GRAPH_SHOWALL_TOGGLED,
  AC_GRAPH_FUND_ITEM_TOGGLED,
  AC_GRAPH_FUNDS_CLICKED,
  AC_GRAPH_FUNDS_ZOOMED,
  AC_GRAPH_FUNDS_HOVERED
} from '../constants/actions';

import {
  rErrorMessageOpen,
  rErrorMessageClose,
  rErrorMessageRemove,
  rErrorMessageClearOld
} from './ErrorReducer';
import {
  rLoginFormInput,
  rLoginFormReset,
  rLoginFormSubmit,
  rLoginFormHandleResponse
} from './LoginFormReducer';
import {
  rLogout,
  rLoadCookies,
  rNavigateToPage,
  rHandleKeyPress,
  rUpdateServer,
  rHandleServerUpdate
} from './HeaderReducer';
import {
  rHandleContentResponse
} from './ContentReducer';
import {
  rActivateEditable,
  rChangeEditable,
  rAddListItem,
  rDeleteListItem,

  rHandleServerAdd,
  rChangeFundTransactions,
  rAddFundTransactions,
  rRemoveFundTransactions
} from './EditReducer';
import {
  rToggleShowAll,
  rToggleFundItemGraph,
  rToggleFundsGraphMode,
  rZoomFundsGraph,
  rHoverFundsGraph
} from './GraphReducer';

export default (reduction, action) => {
  switch (action.type) {
  // error message actions
  case AC_ERROR_OPEN:
    return rErrorMessageOpen(reduction, action.payload);
  case AC_ERROR_CLOSE:
    return rErrorMessageClose(reduction, action.payload);
  case AC_ERROR_REMOVE:
    return rErrorMessageRemove(reduction, action.payload);
  case AC_ERRORS_TIMEDOUT:
    return rErrorMessageClearOld(reduction);

  // login form actions
  case AC_LOGIN_FORM_INPUTTED:
    return rLoginFormInput(reduction, action.payload);
  case AC_LOGIN_FORM_RESET:
    return rLoginFormReset(reduction, action.payload);
  case AC_LOGIN_FORM_SUBMITTED:
    return rLoginFormSubmit(reduction);
  case AC_LOGIN_FORM_RESPONSE_GOT:
    return rLoginFormHandleResponse(reduction, action.payload);

  // header / app actions
  case AC_USER_LOGGED_OUT:
    return rLogout(reduction);
  case AC_COOKIES_LOADED:
    return rLoadCookies(reduction);
  case AC_PAGE_NAVIGATED:
    return rNavigateToPage(reduction, action.payload);
  case AC_KEY_PRESSED:
    return rHandleKeyPress(reduction, action.payload);
  case AC_SERVER_UPDATED:
    return rUpdateServer(reduction);
  case AC_SERVER_UPDATE_RECEIVED:
    return rHandleServerUpdate(reduction, action.payload);
  case AC_SERVER_ADD_RECEIVED:
    return rHandleServerAdd(reduction, action.payload);

  // content actions
  case AC_CONTENT_LOADED:
    return rHandleContentResponse(reduction, action.payload);

  // editable actions
  case AC_EDIT_ACTIVATED:
    return rActivateEditable(reduction, action.payload);
  case AC_EDIT_CHANGED:
    return rChangeEditable(reduction, action.payload);
  case AC_EDIT_LIST_ITEM_ADDED:
    return rAddListItem(reduction, action.payload);
  case AC_EDIT_LIST_ITEM_DELETED:
    return rDeleteListItem(reduction, action.payload);

  case AC_EDIT_FUND_TRANSACTIONS_CHANGED:
    return rChangeFundTransactions(reduction, action.payload);
  case AC_EDIT_FUND_TRANSACTIONS_ADDED:
    return rAddFundTransactions(reduction, action.payload);
  case AC_EDIT_FUND_TRANSACTIONS_REMOVED:
    return rRemoveFundTransactions(reduction, action.payload);

  case AC_GRAPH_SHOWALL_TOGGLED:
    return rToggleShowAll(reduction);
  case AC_GRAPH_FUND_ITEM_TOGGLED:
    return rToggleFundItemGraph(reduction, action.payload);
  case AC_GRAPH_FUNDS_CLICKED:
    return rToggleFundsGraphMode(reduction);
  case AC_GRAPH_FUNDS_ZOOMED:
    return rZoomFundsGraph(reduction, action.payload);
  case AC_GRAPH_FUNDS_HOVERED:
    return rHoverFundsGraph(reduction, action.payload);

  default:
    // By default, the reduction is simply returned unchanged.
    return reduction;
  }
};

