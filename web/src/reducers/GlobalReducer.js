/**
 * This is run whenever an action is called by a view, and decides which
 * reducer to run based on the action given.
 */

import * as AC from '../constants/actions';

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
    rHandleContentResponse,
    rContentBlockHover,
    rContentUpdateBlocks
} from './ContentReducer';
import {
    rAnalysisChangePeriod,
    rAnalysisChangeGrouping,
    rAnalysisChangeTimeIndex,
    rAnalysisHandleNewData,

    rAnalysisTreeToggleDisplay,
    rAnalysisTreeToggleExpand,
    rAnalysisTreeHover,
    rAnalysisBlockClick
} from './data/analysis';
import {
    rActivateEditable,
    rChangeEditable,
    rAddListItem,
    rDeleteListItem,
    rRequestSuggestions,
    rHandleSuggestions,
    rHandleServerAdd,
    rChangeFundTransactions,
    rAddFundTransactions,
    rRemoveFundTransactions
} from './EditReducer';
import {
    rOpenFormDialogEdit,
    rOpenFormDialogAdd,
    rCloseFormDialogEdit,
    rCloseFormDialogAdd,
    rHandleFormInputChange
} from './FormReducer';
import {
    rToggleShowAll,
    rToggleFundItemGraph,
    rToggleFundsGraphMode,
    rZoomFundsGraph,
    rHoverFundsGraph,
    rToggleFundsGraphLine,
    rChangeFundsGraphPeriod,
    rHandleFundPeriodResponse
} from './GraphReducer';
import {
    rLoadStocksList,
    rHandleStocksListResponse,
    rLoadStocksPrices,
    rHandleStocksPricesResponse
} from './StocksListReducer';

// eslint-disable-next-line complexity
export default (reduction, action) => {
    switch (action.type) {
    // error message actions

    case AC.ERROR_OPEN:
        return rErrorMessageOpen(reduction, action.payload);

    case AC.ERROR_CLOSE:
        return rErrorMessageClose(reduction, action.payload);

    case AC.ERROR_REMOVE:
        return rErrorMessageRemove(reduction, action.payload);

    case AC.ERRORS_TIMEDOUT:
        return rErrorMessageClearOld(reduction);

    // login form actions
    case AC.LOGIN_FORM_INPUTTED:
        return rLoginFormInput(reduction, action.payload);

    case AC.LOGIN_FORM_RESET:
        return rLoginFormReset(reduction, action.payload);

    case AC.LOGIN_FORM_SUBMITTED:
        return rLoginFormSubmit(reduction);

    case AC.LOGIN_FORM_RESPONSE_GOT:
        return rLoginFormHandleResponse(reduction, action.payload);

    // header / app actions
    case AC.USER_LOGGED_OUT:
        return rLogout(reduction);

    case AC.COOKIES_LOADED:
        return rLoadCookies(reduction);

    case AC.PAGE_NAVIGATED:
        return rNavigateToPage(reduction, action.payload);

    case AC.KEY_PRESSED:
        return rHandleKeyPress(reduction, action.payload);

    case AC.SERVER_UPDATED:
        return rUpdateServer(reduction);

    case AC.SERVER_UPDATE_RECEIVED:
        return rHandleServerUpdate(reduction, action.payload);

    case AC.SERVER_ADD_RECEIVED:
        return rHandleServerAdd(reduction, action.payload);

    // content actions
    case AC.CONTENT_LOADED:
        return rHandleContentResponse(reduction, action.payload);

    case AC.CONTENT_BLOCK_HOVERED:
        return rContentBlockHover(reduction, action.payload);

    case AC.CONTENT_BLOCKS_RECEIVED:
        return rContentUpdateBlocks(reduction, action.payload);

    // analysis actions
    case AC.ANALYSIS_PERIOD_CHANGED:
        return rAnalysisChangePeriod(reduction, action.payload);

    case AC.ANALYSIS_GROUPING_CHANGED:
        return rAnalysisChangeGrouping(reduction, action.payload);

    case AC.ANALYSIS_TIME_INDEX_CHANGED:
        return rAnalysisChangeTimeIndex(reduction, action.payload);

    case AC.ANALYSIS_DATA_REFRESHED:
        return rAnalysisHandleNewData(reduction, action.payload);


    case AC.ANALYSIS_TREE_DISPLAY_TOGGLED:
        return rAnalysisTreeToggleDisplay(reduction, action.payload);

    case AC.ANALYSIS_TREE_EXPAND_TOGGLED:
        return rAnalysisTreeToggleExpand(reduction, action.payload);

    case AC.ANALYSIS_TREE_HOVERED:
        return rAnalysisTreeHover(reduction, action.payload);

    case AC.ANALYSIS_BLOCK_CLICKED:
        return rAnalysisBlockClick(reduction, action.payload);

    // editable actions
    case AC.EDIT_ACTIVATED:
        return rActivateEditable(reduction, action.payload);

    case AC.EDIT_CHANGED:
        return rChangeEditable(reduction, action.payload);

    case AC.EDIT_LIST_ITEM_ADDED:
        return rAddListItem(reduction, action.payload);

    case AC.EDIT_LIST_ITEM_DELETED:
        return rDeleteListItem(reduction, action.payload);

    case AC.EDIT_SUGGESTIONS_REQUESTED:
        return rRequestSuggestions(reduction, action.payload);

    case AC.EDIT_SUGGESTIONS_RECEIVED:
        return rHandleSuggestions(reduction, action.payload);


    case AC.EDIT_FUND_TRANSACTIONS_CHANGED:
        return rChangeFundTransactions(reduction, action.payload);

    case AC.EDIT_FUND_TRANSACTIONS_ADDED:
        return rAddFundTransactions(reduction, action.payload);

    case AC.EDIT_FUND_TRANSACTIONS_REMOVED:
        return rRemoveFundTransactions(reduction, action.payload);

    // mobile form actions
    case AC.FORM_EDIT_DIALOG_OPENED:
        return rOpenFormDialogEdit(reduction, action.payload);

    case AC.FORM_ADD_DIALOG_OPENED:
        return rOpenFormDialogAdd(reduction, action.payload);

    case AC.FORM_EDIT_DIALOG_CLOSED:
        return rCloseFormDialogEdit(reduction, action.payload);

    case AC.FORM_ADD_DIALOG_CLOSED:
        return rCloseFormDialogAdd(reduction, action.payload);

    case AC.FORM_INPUT_CHANGED:
        return rHandleFormInputChange(reduction, action.payload);

    // graph actions
    case AC.GRAPH_SHOWALL_TOGGLED:
        return rToggleShowAll(reduction);

    case AC.GRAPH_FUND_ITEM_TOGGLED:
        return rToggleFundItemGraph(reduction, action.payload);

    case AC.GRAPH_FUNDS_CLICKED:
        return rToggleFundsGraphMode(reduction);

    case AC.GRAPH_FUNDS_ZOOMED:
        return rZoomFundsGraph(reduction, action.payload);

    case AC.GRAPH_FUNDS_HOVERED:
        return rHoverFundsGraph(reduction, action.payload);

    case AC.GRAPH_FUNDS_LINE_TOGGLED:
        return rToggleFundsGraphLine(reduction, action.payload);

    case AC.GRAPH_FUNDS_PERIOD_CHANGED:
        return rChangeFundsGraphPeriod(reduction, action.payload);

    case AC.GRAPH_FUNDS_PERIOD_LOADED:
        return rHandleFundPeriodResponse(reduction, action.payload);


    case AC.STOCKS_LIST_REQUESTED:
        return rLoadStocksList(reduction);

    case AC.STOCKS_LIST_RECEIVED:
        return rHandleStocksListResponse(reduction, action.payload);

    case AC.STOCKS_PRICES_REQUESTED:
        return rLoadStocksPrices(reduction);

    case AC.STOCKS_PRICES_RECEIVED:
        return rHandleStocksPricesResponse(reduction, action.payload);

    default:
        // By default, the reduction is simply returned unchanged.
        return reduction;
    }
};

