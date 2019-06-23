export const getModalState = state => ({
    modalDialogType: state.getIn(['modalDialog', 'type']),
    invalidKeys: state.getIn(['modalDialog', 'invalidKeys']),
    modalDialogLoading: state.getIn(['modalDialog', 'loading']),
    item: state.getIn(['modalDialog', 'fieldsString']),
    fields: state.getIn(['modalDialog', 'fieldsValidated'])
});

export const suggestionsInfo = state => ({
    page: state.get('currentPage'),
    item: state.getIn(['edit', 'active', 'item']),
    value: state.getIn(['edit', 'active', 'value'])
});
