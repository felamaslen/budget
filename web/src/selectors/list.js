import { createSelector } from 'reselect';

export const getPageRow = (state, { page, id, row }) =>
    row || state.getIn(['pages', page, 'rows', id]);

export const getAllPageRows = (state, { page }) => state.getIn(['pages', page, 'rows']);

export const makeGetRowIds = () => createSelector([getAllPageRows], rows =>
    rows && rows.keySeq().toList());

