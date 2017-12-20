/**
 * get an editable component for use in another component
 */

import { Map as map } from 'immutable';
import { connect } from 'react-redux';

import * as actions from '../../actions/edit.actions';
import Editable from '../../components/editable';

function getStateProps(row, col, item, value, getSuggestions) {
    return state => {
        const activeEditable = state.getIn(['edit', 'active']);
        const active = activeEditable.get('row') === row && activeEditable.get('col') === col;

        const props = {
            row,
            col,
            item,
            value,
            active
        };

        if (getSuggestions) {
            props.suggestionsList = state.getIn(['editSuggestions', 'list']);
            props.suggestionsActive = state.getIn(['editSuggestions', 'active']);
        }

        return props;
    };
}

function getDispatchProps(row, col, item, value) {
    return (dispatch, ownProps) => {
        const props = {
            onActivate: () => {
                if (ownProps.static) {
                    return;
                }

                dispatch(actions.aEditableActivated({
                    page: ownProps.page,
                    editable: map({ row, col, item, value })
                }));
            },
            onChange: processedValue => dispatch(actions.aEditableChanged(processedValue))
        };

        if (item === 'transactions') {
            props.addTransaction = transaction => dispatch(actions.aFundTransactionsAdded(transaction));
            props.editTransaction = transaction => dispatch(actions.aFundTransactionsChanged(transaction));
            props.removeTransaction = transaction => dispatch(actions.aFundTransactionsRemoved(transaction));
        }

        return props;
    };
}

export default ({ row, col, item, value }) => {
    const getSuggestions = ['date', 'cost', 'transactions'].indexOf(item) === -1;

    const mapStateToProps = getStateProps(row, col, item, value, getSuggestions);

    const mapDispatchToProps = getDispatchProps(row, col, item, value, getSuggestions);

    return connect(mapStateToProps, mapDispatchToProps)(Editable);
};

