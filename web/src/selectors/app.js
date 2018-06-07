export const getApiKey = state => state.getIn(['user', 'apiKey']);

export const getRequestList = state => state.getIn(['edit', 'requestList'])
    .map(item => item.get('req'));

export const getAddData = state => ({
    fields: state.getIn(['edit', 'addFields']),
    item: state.getIn(['edit', 'addFieldsString'])
});

export const getContentParamsAnalysis = state => ({
    periodKey: state.getIn(['other', 'analysis', 'period']),
    groupingKey: state.getIn(['other', 'analysis', 'grouping']),
    timeIndex: state.getIn(['other', 'analysis', 'timeIndex'])
});

export const getLoadedStatus = (state, page) => Boolean(state.getIn(['pagesLoaded', page]));

