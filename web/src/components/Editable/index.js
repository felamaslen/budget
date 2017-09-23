/**
 * get an editable component for use in another component
 */

import { Map as map } from 'immutable';
import { connect } from 'react-redux';

import debounce from '../../misc/debounce';
import {
    aEditableActivated, aEditableChanged, aSuggestionsRequested,
    aFundTransactionsChanged, aFundTransactionsAdded, aFundTransactionsRemoved
} from '../../actions/EditActions';

import EditableDate from './EditableDate';
import EditableCost from './EditableCost';
import EditableText from './EditableText';
import EditableTransactions from './EditableTransactions';

function getEditableComponent(item) {
    if (item === 'date') {
        return EditableDate;
    }

    if (item === 'cost') {
        return EditableCost;
    }

    if (item === 'transactions') {
        return EditableTransactions;
    }

    return EditableText;
}

function getStateProps(row, col, id, item, value, getSuggestions) {
    let theValue = value;
    if (item === 'cost' && !value) {
        theValue = 0;
    }

    return state => {
        const activeEditable = state.getIn(['global', 'edit', 'active']);
        const active = activeEditable.get('row') === row &&
            activeEditable.get('col') === col;

        const props = {
            pageIndex: state.getIn(['global', 'currentPageIndex']),
            row,
            col,
            id,
            item,
            value: theValue,
            active
        };

        if (getSuggestions) {
            props.suggestionsList = state.getIn(['global', 'edit', 'suggestions', 'list']);
            props.suggestionsActive = state.getIn(['global', 'edit', 'suggestions', 'active']);
        }

        return props;
    };
}

function getDispatchProps(row, col, id, item, value, getSuggestions) {
    return dispatch => {
        const props = {
            onActivate: () => dispatch(aEditableActivated(map({ row, col, id, item, value }))),
            onChange: processedValue => dispatch(aEditableChanged(processedValue))
        };

        if (getSuggestions) {
            const suggestionsTimeout = 100;
            const immediate = true;

            props.requestSuggestions = debounce(
                processedValue => dispatch(aSuggestionsRequested(processedValue)),
                suggestionsTimeout,
                immediate,
                null
            );
        }

        if (item === 'transactions') {
            props.addTransaction = transaction => dispatch(aFundTransactionsAdded(transaction));
            props.editTransaction = transaction => dispatch(aFundTransactionsChanged(transaction));
            props.removeTransaction = transaction => dispatch(aFundTransactionsRemoved(transaction));
        }

        return props;
    };
}

export default ({ row, col, id, item, value }) => {
    const Component = getEditableComponent(item);

    const getSuggestions = ['date', 'cost', 'transactions'].indexOf(item) === -1;

    const mapStateToProps = getStateProps(row, col, id, item, value, getSuggestions);

    const mapDispatchToProps = getDispatchProps(row, col, id, item, value, getSuggestions);

    return connect(mapStateToProps, mapDispatchToProps)(Component);
};

