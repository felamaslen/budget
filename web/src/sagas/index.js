import { takeEvery, takeLatest, fork, all } from 'redux-saga/effects';

import * as actions from '../constants/actions';

import { loadSettings, updateServerData, addServerData } from './app.saga';
import { submitLoginForm, logoutUser } from './login.saga';
import { requestContent } from './content.saga';
import { requestEditSuggestions, handleModal } from './edit.saga';
import { requestAnalysisData } from './analysis.saga';
import { requestFundPeriodData, requestStocksList, requestStocksPrices } from './funds.saga';

export const selectApiKey = state => state.getIn(['user', 'apiKey'])

export function *watchSettingsLoaded() {
    yield takeLatest(actions.SETTINGS_LOADED, loadSettings);
}
export function *watchAuthentication() {
    yield all([
        takeLatest(actions.LOGIN_FORM_SUBMITTED, submitLoginForm),
        takeLatest(actions.USER_LOGGED_OUT, logoutUser)
    ]);
}

export function *watchContent() {
    yield all([
        takeEvery(actions.CONTENT_REQUESTED, requestContent),
        takeLatest(actions.SERVER_UPDATED, updateServerData),
        takeLatest(actions.EDIT_LIST_ITEM_ADDED, addServerData)
    ]);
}

export function *watchEdit() {
    yield all([
        takeLatest(actions.EDIT_SUGGESTIONS_REQUESTED, requestEditSuggestions),
        takeLatest(actions.FORM_DIALOG_CLOSED, handleModal)
    ]);
}

export function *watchAnalysis() {
    yield all([
        takeEvery(actions.ANALYSIS_BLOCK_CLICKED, requestAnalysisData),
        takeEvery(actions.ANALYSIS_OPTION_CHANGED, requestAnalysisData)
    ]);
}

export function *watchFunds() {
    yield all([
        takeEvery(actions.GRAPH_FUNDS_PERIOD_CHANGED, requestFundPeriodData),
        takeLatest(actions.STOCKS_LIST_REQUESTED, requestStocksList),
        takeLatest(actions.STOCKS_PRICES_REQUESTED, requestStocksPrices)
    ]);
}

export default function *rootSaga() {
    yield fork(watchSettingsLoaded);
    yield fork(watchAuthentication);

    yield fork(watchContent);
    yield fork(watchEdit);
    yield fork(watchAnalysis);
    yield fork(watchFunds);
}

