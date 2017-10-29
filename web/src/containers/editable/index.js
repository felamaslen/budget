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

import EditableDate from '../../components/editable/date';
import EditableCost from '../../components/editable/cost';
import EditableText from '../../components/editable/text';
import EditableTransactions from '../../components/editable/transactions';

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

function getDispatchProps(row, col, item, value, getSuggestions) {
    return (dispatch, ownProps) => {
        const props = {
            onActivate: () => {
                if (ownProps.static) {
                    return;
                }

                dispatch(aEditableActivated({
                    pageIndex: ownProps.pageIndex,
                    editable: map({ row, col, item, value })
                }));
            },
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

export default ({ row, col, item, value }) => {
    const Component = getEditableComponent(item);

    const getSuggestions = ['date', 'cost', 'transactions'].indexOf(item) === -1;

    const mapStateToProps = getStateProps(row, col, item, value, getSuggestions);

    const mapDispatchToProps = getDispatchProps(row, col, item, value, getSuggestions);

    return connect(mapStateToProps, mapDispatchToProps)(Component);
};

