import { createSelector } from 'reselect';

import { getApiKey } from '~client/selectors/api';

export const getNow = state => state.now;

const getUid = state => state.login.user.uid;

export const getLoggedIn = createSelector(getApiKey, getUid, (apiKey, uid) => Boolean(apiKey && uid));

export const getCurrentPage = state => state.currentPage;

export const getAddData = state => ({
    fields: state.edit.addFields,
    item: state.edit.addFieldsString
});

export const getContentParamsAnalysis = state => ({
    periodKey: state.other.analysis.period,
    groupingKey: state.other.analysis.grouping,
    timeIndex: state.other.analysis.timeIndex
});

export const getLoadedStatus = (state, { page }) => page in state.pages;
