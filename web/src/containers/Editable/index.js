/**
 * get an editable component for use in another component
 */

import './style.scss';
import { Map as map } from 'immutable';
import { connect } from 'react-redux';
import * as actions from '../../actions/edit.actions';
import React from 'react';
import PropTypes from 'prop-types';
import EditableActive from './editable-active';
import EditableInactive from './editable-inactive';

function Editable({ active, ...props }) {
    if (active) {
        return <EditableActive {...props} />;
    }

    return <EditableInactive {...props} />;
}

Editable.propTypes = {
    active: PropTypes.bool.isRequired
};

const mapStateToProps = (state, { row, col, item, value }) => ({
    row,
    col,
    item,
    value,
    active: state.getIn(['edit', 'active', 'row']) === row &&
        state.getIn(['edit', 'active', 'col']) === col
});

const mapDispatchToProps = dispatch => ({
    onActivate: ({ page, row, col, item, value, staticEdit }) => {
        if (staticEdit) {
            return;
        }

        dispatch(actions.aEditableActivated({
            page,
            editable: map({ row, col, item, value })
        }));
    },
    onChange: processedValue => dispatch(actions.aEditableChanged(processedValue)),
    addTransaction: transaction => dispatch(actions.aFundTransactionsAdded(transaction)),
    editTransaction: transaction => dispatch(actions.aFundTransactionsChanged(transaction)),
    removeTransaction: transaction => dispatch(actions.aFundTransactionsRemoved(transaction))
});

export default connect(mapStateToProps, mapDispatchToProps)(Editable);

