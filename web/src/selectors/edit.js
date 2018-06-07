export const getModalState = state => ({
    modalDialogType: state.getIn(['modalDialog', 'type']),
    invalidKeys: state.getIn(['modalDialog', 'invalidKeys']),
    modalDialogLoading: state.getIn(['modalDialog', 'loading']),
    item: state.getIn(['modalDialog', 'fieldsString']),
    fields: state.getIn(['modalDialog', 'fieldsValidated'])
});

export const suggestionsInfo = reduction => ({
    page: reduction.get('currentPage'),
    item: reduction.getIn(['edit', 'active', 'item']),
    value: reduction.getIn(['edit', 'active', 'value'])
});

