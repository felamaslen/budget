export const getModalState = state => ({
    modalDialogType: state.modalDialog.type,
    invalidKeys: state.modalDialog.invalidKeys,
    modalDialogLoading: state.modalDialog.loading,
    item: state.modalDialog.fieldsString,
    fields: state.modalDialog.fieldsValidated
});

export const suggestionsInfo = state => ({
    page: state.currentPage,
    item: state.edit.active.item,
    value: state.edit.active.value
});
