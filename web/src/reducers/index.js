/**
 * This is run whenever an action is called by a view, and decides which
 * reducer to run based on the action given.
 */

import { createReducer } from 'redux-create-reducer';

import * as AC from '~client/constants/actions';

import * as error from './error.reducer';
import * as login from './login-form.reducer';
import * as app from './app.reducer';
import * as content from './content.reducer';
import * as analysis from './analysis.reducer';
import * as edit from './edit.reducer';
import * as editUpdates from './editable-updates.reducer';
import * as form from './form.reducer';
import * as graph from './graph.reducer';
import * as stocksList from './stocks-list.reducer';

import initialState from '../reduction';

const createReducerObject = array => array.reduce((obj, [type, handler]) => ({
    ...obj,
    [type]: handler
}), {});

const reducers = createReducerObject([
    // login form actions
    [AC.LOGIN_FORM_INPUTTED, login.rLoginFormInput],
    [AC.LOGIN_FORM_RESET, login.rLoginFormReset],
    [AC.LOGIN_FORM_RESPONSE_GOT, login.rLoginFormHandleResponse],

    // error messages actions
    [AC.ERROR_CLOSED, error.rErrorMessageClose],
    [AC.ERROR_OPENED, error.rErrorMessageOpen],
    [AC.ERROR_REMOVED, error.rErrorMessageRemove],

    // app actions
    [AC.WINDOW_RESIZED, app.rOnWindowResize],
    [AC.USER_LOGGED_OUT, app.rLogout],
    [AC.KEY_PRESSED, app.rHandleKeyPress],
    [AC.TIME_UPDATED, app.rUpdateTime],
    [AC.SERVER_UPDATED, app.rUpdateServer],
    [AC.SERVER_UPDATE_RECEIVED, app.rHandleServerUpdate],
    [AC.SERVER_ADD_RECEIVED, edit.rHandleServerAdd],

    // content actions
    [AC.CONTENT_LOADED, content.rHandleContentResponse],
    [AC.CONTENT_REQUESTED, content.rRequestContent],
    [AC.CONTENT_BLOCK_HOVERED, content.rContentBlockHover],
    [AC.PAGE_SET, content.rSetPage],
    [AC.FUNDS_VIEW_SOLD_TOGGLED, content.rToggleViewSold],

    // analysis actions
    [AC.ANALYSIS_OPTION_CHANGED, analysis.rAnalysisChangeOption],
    [AC.ANALYSIS_DATA_REFRESHED, analysis.rAnalysisHandleNewData],
    [AC.ANALYSIS_TREE_DISPLAY_TOGGLED, analysis.rAnalysisTreeToggleDisplay],
    [AC.ANALYSIS_TREE_EXPAND_TOGGLED, analysis.rAnalysisTreeToggleExpand],
    [AC.ANALYSIS_TREE_HOVERED, analysis.rAnalysisTreeHover],
    [AC.ANALYSIS_BLOCK_CLICKED, analysis.rAnalysisBlockClick],

    // editable actions
    [AC.EDIT_ACTIVATED, edit.rActivateEditable],
    [AC.EDIT_CHANGED, edit.rChangeEditable],
    [AC.EDIT_LIST_ITEM_ADDED, edit.rAddListItem],
    [AC.EDIT_LIST_ITEM_DELETED, editUpdates.rDeleteListItem],
    [AC.EDIT_SUGGESTIONS_REQUESTED, edit.rRequestSuggestions],
    [AC.EDIT_SUGGESTIONS_RECEIVED, edit.rHandleSuggestions],

    [AC.EDIT_FUND_TRANSACTIONS_CHANGED, edit.rChangeFundTransactions],
    [AC.EDIT_FUND_TRANSACTIONS_ADDED, edit.rAddFundTransactions],
    [AC.EDIT_FUND_TRANSACTIONS_REMOVED, edit.rRemoveFundTransactions],

    // mobile form actions
    [AC.FORM_EDIT_DIALOG_OPENED, form.rOpenFormDialogEdit],
    [AC.FORM_ADD_DIALOG_OPENED, form.rOpenFormDialogAdd],
    [AC.FORM_DIALOG_CLOSED, form.rCloseFormDialog],
    [AC.FORM_INPUT_CHANGED, form.rHandleFormInputChange],

    // graph actions
    [AC.GRAPH_FUNDS_CLICKED, graph.rToggleFundsGraphMode],
    [AC.GRAPH_FUNDS_LINE_TOGGLED, graph.rToggleFundsGraphLine],
    [AC.GRAPH_FUNDS_PERIOD_CHANGED, graph.rChangeFundsGraphPeriod],
    [AC.GRAPH_FUNDS_PERIOD_LOADED, graph.rHandleFundPeriodResponse],

    // stocks list actions
    [AC.STOCKS_LIST_RECEIVED, stocksList.rHandleStocksListResponse],
    [AC.STOCKS_PRICES_RECEIVED, stocksList.rHandleStocksPricesResponse]
]);

export default createReducer(initialState, reducers);

