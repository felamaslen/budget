import { createSelector } from 'reselect';

export const getNow = state => state.now;

export const getApiKey = state => state.user.apiKey;

const getUid = state => state.user.uid;

export const getLoggedIn = createSelector(getApiKey, getUid, (apiKey, uid) => Boolean(apiKey && uid));

export const getCurrentPage = state => state.currentPage;

export const getRawRequestList = state => state.edit.requestList;

export const getRequestList = createSelector([getRawRequestList], requestList => requestList.map(({ req }) => req));

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
