/**
 * get an editable component for use in another component
 */

import { Map as map } from 'immutable';
import { connect } from 'react-redux';

import debounce from '../../misc/debounce';
import { PAGES } from '../../misc/const';
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

function getStateProps(row, col, id, item, defaultValue, getSuggestions) {
    return (state, ownProps) => {
        const activeEditable = state.getIn(['global', 'edit', 'active']);
        const active = activeEditable.get('row') === row &&
            activeEditable.get('col') === col;

        const value = row === -1
            ? defaultValue
            : state.getIn(
                ['global', 'pages', ownProps.pageIndex, 'rows', row, 'cols', col]
            );

        const props = {
            row,
            col,
            id,
            item,
            value,
            active
        };

        if (getSuggestions) {
            props.suggestionsList = state.getIn(['global', 'editSuggestions', 'list']);
            props.suggestionsActive = state.getIn(['global', 'editSuggestions', 'active']);
        }

        return props;
    };
}

function getDispatchProps(row, col, id, item, value, getSuggestions) {
    return (dispatch, ownProps) => {
        const props = {
            onActivate: () => dispatch(aEditableActivated(map({ row, col, id, item, value }))),
            onChange: processedValue => dispatch(aEditableChanged(processedValue))
        };

        if (getSuggestions) {
            if (ownProps.noSuggestions) {
                props.requestSuggestions = () => null;
            }
            else {
                const suggestionsTimeout = 100;
                const immediate = true;

                props.requestSuggestions = debounce(
                    processedValue => dispatch(aSuggestionsRequested({
                        page: PAGES[ownProps.pageIndex],
                        item,
                        value: processedValue
                    })),
                    suggestionsTimeout,
                    immediate
                );
            }
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

