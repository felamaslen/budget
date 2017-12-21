/**
 * get an editable component for use in another component
 */

import { Map as map } from 'immutable';
import { connect } from 'react-redux';

import * as actions from '../../actions/edit.actions';
import Editable from '../../components/editable';

const mapStateToProps = (state, { row, col, item, value }) => ({
    row,
    col,
    item,
    value,
    active: state.getIn(['edit', 'active', 'row']) === row &&
        state.getIn(['edit', 'active', 'col']) === col,
    suggestionsList: state.getIn(['editSuggestions', 'list']),
    suggestionsActive: state.getIn(['editSuggestions', 'active'])
});

const mapDispatchToProps = (dispatch, { page, row, col, item, value, staticEdit }) => {
    const props = {
        onActivate: () => {
            if (staticEdit) {
                return;
            }

            dispatch(actions.aEditableActivated({
                page,
                editable: map({ row, col, item, value })
            }));
        },
        onChange: processedValue => dispatch(actions.aEditableChanged(processedValue))
    };

    if (item === 'transactions') {
        return {
            ...props,
            addTransaction: transaction => dispatch(actions.aFundTransactionsAdded(transaction)),
            editTransaction: transaction => dispatch(actions.aFundTransactionsChanged(transaction)),
            removeTransaction: transaction => dispatch(actions.aFundTransactionsRemoved(transaction))
        };
    }

    return props;
};

export default connect(mapStateToProps, mapDispatchToProps)(Editable);

