import { createSelector } from 'reselect';

export const getNow = state => state.get('now');

export const getApiKey = state => state.getIn(['user', 'apiKey']);

const getUid = state => state.getIn(['user', 'uid']);

export const getLoggedIn = createSelector(getApiKey, getUid, (apiKey, uid) => Boolean(apiKey && uid));

export const getRawRequestList = state => state.getIn(['edit', 'requestList']);

export const getRequestList = createSelector([getRawRequestList], requestList =>
    requestList.map(item => item.get('req')));

export const getAddData = state => ({
    fields: state.getIn(['edit', 'addFields']),
    item: state.getIn(['edit', 'addFieldsString'])
});

export const getContentParamsAnalysis = state => ({
    periodKey: state.getIn(['other', 'analysis', 'period']),
    groupingKey: state.getIn(['other', 'analysis', 'grouping']),
    timeIndex: state.getIn(['other', 'analysis', 'timeIndex'])
});

export const getLoadedStatus = (state, { page }) => state.get('pages').has(page);
