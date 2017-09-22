/**
 * This is run whenever an action is called by a view, and decides which
 * reducer to run based on the action given.
 */

import { createReducer } from 'redux-create-reducer';

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
    rNavigateToPage,
    rHandleKeyPress,
    rUpdateTime,
    rUpdateServer,
    rHandleServerUpdate
} from './AppReducer';
import {
    rHandleContentResponse,
    rRequestContent,
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
    rCloseFormDialog,
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

import initialState from '../reduction';

function createReducerObject(array) {
    return array.reduce((obj, item) => {
        obj[item[0]] = (reduction, action) => item[1](reduction, action.payload);

        return obj;
    });
}

const reducers = createReducerObject([
    [AC.ERROR_OPEN, rErrorMessageOpen],
    [AC.ERROR_CLOSE, rErrorMessageClose],
    [AC.ERROR_REMOVE, rErrorMessageRemove],
    [AC.ERRORS_TIMEDOUT, rErrorMessageClearOld],

    // login form actions
    [AC.LOGIN_FORM_INPUTTED, rLoginFormInput],
    [AC.LOGIN_FORM_RESET, rLoginFormReset],
    [AC.LOGIN_FORM_SUBMITTED, rLoginFormSubmit], [AC.LOGIN_FORM_RESPONSE_GOT, rLoginFormHandleResponse],

    // app actions
    [AC.USER_LOGGED_OUT, rLogout],
    [AC.PAGE_NAVIGATED, rNavigateToPage],
    [AC.KEY_PRESSED, rHandleKeyPress],
    [AC.TIME_UPDATED, rUpdateTime],
    [AC.SERVER_UPDATED, rUpdateServer],
    [AC.SERVER_UPDATE_RECEIVED, rHandleServerUpdate],
    [AC.SERVER_ADD_RECEIVED, rHandleServerAdd],

    // content actions
    [AC.CONTENT_LOADED, rHandleContentResponse],
    [AC.CONTENT_REQUESTED, rRequestContent],
    [AC.CONTENT_BLOCK_HOVERED, rContentBlockHover],
    [AC.CONTENT_BLOCKS_RECEIVED, rContentUpdateBlocks],

    // analysis actions
    [AC.ANALYSIS_PERIOD_CHANGED, rAnalysisChangePeriod],
    [AC.ANALYSIS_GROUPING_CHANGED, rAnalysisChangeGrouping],
    [AC.ANALYSIS_TIME_INDEX_CHANGED, rAnalysisChangeTimeIndex],
    [AC.ANALYSIS_DATA_REFRESHED, rAnalysisHandleNewData],
    [AC.ANALYSIS_TREE_DISPLAY_TOGGLED, rAnalysisTreeToggleDisplay],
    [AC.ANALYSIS_TREE_EXPAND_TOGGLED, rAnalysisTreeToggleExpand],
    [AC.ANALYSIS_TREE_HOVERED, rAnalysisTreeHover],
    [AC.ANALYSIS_BLOCK_CLICKED, rAnalysisBlockClick],

    // editable actions
    [AC.EDIT_ACTIVATED, rActivateEditable],
    [AC.EDIT_CHANGED, rChangeEditable],
    [AC.EDIT_LIST_ITEM_ADDED, rAddListItem],
    [AC.EDIT_LIST_ITEM_DELETED, rDeleteListItem],
    [AC.EDIT_SUGGESTIONS_REQUESTED, rRequestSuggestions],
    [AC.EDIT_SUGGESTIONS_RECEIVED, rHandleSuggestions],

    [AC.EDIT_FUND_TRANSACTIONS_CHANGED, rChangeFundTransactions],
    [AC.EDIT_FUND_TRANSACTIONS_ADDED, rAddFundTransactions],
    [AC.EDIT_FUND_TRANSACTIONS_REMOVED, rRemoveFundTransactions],

    // mobile form actions
    [AC.FORM_EDIT_DIALOG_OPENED, rOpenFormDialogEdit],
    [AC.FORM_ADD_DIALOG_OPENED, rOpenFormDialogAdd],
    [AC.FORM_DIALOG_CLOSED, rCloseFormDialog],
    [AC.FORM_INPUT_CHANGED, rHandleFormInputChange],

    // graph actions
    [AC.GRAPH_SHOWALL_TOGGLED, rToggleShowAll],

    [AC.GRAPH_FUND_ITEM_TOGGLED, rToggleFundItemGraph],
    [AC.GRAPH_FUNDS_CLICKED, rToggleFundsGraphMode],
    [AC.GRAPH_FUNDS_ZOOMED, rZoomFundsGraph],
    [AC.GRAPH_FUNDS_HOVERED, rHoverFundsGraph],
    [AC.GRAPH_FUNDS_LINE_TOGGLED, rToggleFundsGraphLine],
    [AC.GRAPH_FUNDS_PERIOD_CHANGED, rChangeFundsGraphPeriod],
    [AC.GRAPH_FUNDS_PERIOD_LOADED, rHandleFundPeriodResponse],


    [AC.STOCKS_LIST_REQUESTED, rLoadStocksList],
    [AC.STOCKS_LIST_RECEIVED, rHandleStocksListResponse],
    [AC.STOCKS_PRICES_REQUESTED, rLoadStocksPrices],
    [AC.STOCKS_PRICES_RECEIVED, rHandleStocksPricesResponse]
]);

export default createReducer(initialState, reducers);

