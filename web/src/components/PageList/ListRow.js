import { Map as map } from 'immutable';
import extendableContainer from '../containerExtender';

import { aListItemDeleted } from '../../actions/EditActions';

import React from 'react';
import PureComponent from '../ImmutableComponent';
import PropTypes from 'prop-types';
import classNames from 'classnames';

import { PAGES, LIST_COLS_PAGES, DAILY_PAGES } from '../../misc/const';
import { formatCurrency } from '../../misc/format';

import getEditable from '../Editable';

export class ListRow extends PureComponent {
    renderListExtra() {
        return null;
    }
    renderColumn(colKey, colName, value, active = false) {
        const Editable = getEditable({
            row: this.props.id,
            col: colKey,
            item: colName,
            value
        });

        const spanClasses = classNames({
            [colName]: true,
            active
        });

        return <span key={colKey} className={spanClasses}>
            <Editable noSuggestions={this.props.noSuggestions}
                pageIndex={this.props.pageIndex} />
        </span>;
    }
    dailyText() {
        if (!this.props.getDaily) {
            return null;
        }

        if (!this.props.row.has('daily')) {
            return <span className="daily" />;
        }

        return <span className="daily">
            {formatCurrency(this.props.row.get('daily'))}
        </span>;
    }
    listItemClasses() {
        return {};
    }
    render() {
        const onDelete = () => this.props.deleteRow();

        const deleteBtn = <span className="delete">
            <a onClick={onDelete}>&minus;</a>
        </span>;

        const items = LIST_COLS_PAGES[this.props.pageIndex].map((colName, colKey) => {
            const value = this.props.row.getIn(['cols', colKey]);
            const active = this.props.activeCol === colKey;

            return this.renderColumn(colKey, colName, value, active);
        });

        const itemClasses = this.listItemClasses();
        itemClasses.future = this.props.row.get('future');
        itemClasses['first-present'] = this.props.row.get('first-present');

        return <li className={classNames(itemClasses)}>
            {items}
            {this.dailyText()}
            {this.renderListExtra()}
            {deleteBtn}
        </li>;
    }
}

ListRow.propTypes = {
    pageIndex: PropTypes.number.isRequired,
    id: PropTypes.number.isRequired,
    row: PropTypes.instanceOf(map).isRequired,
    activeCol: PropTypes.number,
    daily: PropTypes.number,
    getDaily: PropTypes.bool,
    noSuggestions: PropTypes.bool.isRequired,
    deleteRow: PropTypes.func.isRequired
};

const stateDefault = pageIndex => (state, ownProps) => ({
    pageIndex,
    row: state.getIn(['global', 'pages', pageIndex, 'rows', ownProps.id]),
    activeCol: state.getIn(['global', 'edit', 'active', 'row']) === ownProps.id
        ? state.getIn(['global', 'edit', 'active', 'col'])
        : null,
    getDaily: DAILY_PAGES[pageIndex],
    noSuggestions: ['funds'].indexOf(PAGES[pageIndex]) !== -1
});

const dispatchDefault = pageIndex => (dispatch, ownProps) => ({
    deleteRow: () => dispatch(aListItemDeleted({ pageIndex, id: ownProps.id }))
});

export const ListRowContainer = pageIndex =>
    extendableContainer(stateDefault, dispatchDefault)(pageIndex)()(ListRow);

export default extendableContainer(stateDefault, dispatchDefault);

