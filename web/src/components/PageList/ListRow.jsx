import { Map as map } from 'immutable';
import { connect } from 'react-redux';

import { aListItemDeleted } from '../../actions/EditActions';

import React, { PureComponent } from 'react';
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
            const active = this.props.editId === this.props.id &&
                this.props.editCol === colKey;

            return this.renderColumn(colKey, colName, value, active);
        });

        const itemClasses = this.listItemClasses(this.props.row);
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
    daily: PropTypes.number,
    getDaily: PropTypes.bool,
    noSuggestions: PropTypes.bool.isRequired,
    editId: PropTypes.number,
    editCol: PropTypes.number,
    deleteRow: PropTypes.func.isRequired
};

const mapStateToProps = (state, ownProps) => ({
    row: state.getIn(['global', 'pages', ownProps.pageIndex, 'rows', ownProps.id]),
    getDaily: DAILY_PAGES[ownProps.pageIndex],
    noSuggestions: ['funds'].indexOf(PAGES[ownProps.pageIndex]) !== -1,
    editId: state.getIn(['global', 'edit', 'row']),
    editCol: state.getIn(['global', 'edit', 'col'])
});

const mapDispatchToProps = (dispatch, ownProps) => ({
    deleteRow: () => dispatch(aListItemDeleted({
        pageIndex: ownProps.pageIndex,
        id: ownProps.id
    }))
});

export default connect(mapStateToProps, mapDispatchToProps)(ListRow);

