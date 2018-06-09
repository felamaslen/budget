import { createSelector } from 'reselect';

export const getNow = state => state.get('now');

export const getApiKey = state => state.getIn(['user', 'apiKey']);

const getRawRequestList = state => state.getIn(['edit', 'requestList']);

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

const getPages = state => state.get('pages').keySeq();
const getPageProp = (state, { page }) => page;

export const getLoadedStatus = createSelector([getPages, getPageProp], (pages, page) => pages.includes(page));

