export const requestProps = state => ({
    loading: state.other.analysis.loading,
    period: state.other.analysis.period,
    grouping: state.other.analysis.grouping,
    timeIndex: state.other.analysis.timeIndex
});
