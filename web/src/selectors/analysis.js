export const requestProps = state => ({
    loading: state.getIn(['other', 'analysis', 'loading']),
    period: state.getIn(['other', 'analysis', 'period']),
    grouping: state.getIn(['other', 'analysis', 'grouping']),
    timeIndex: state.getIn(['other', 'analysis', 'timeIndex'])
});
