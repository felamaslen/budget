import { Map as map } from 'immutable';
import extendableContainer from '../../../container-extender';

import { aListItemDeleted } from '../../../../actions/edit.actions';

import React from 'react';
import PureComponent from '../../../../immutable-component';
import PropTypes from 'prop-types';
import classNames from 'classnames';

import { PAGES } from '../../../../misc/const';
import { formatCurrency } from '../../../../misc/format';

import Column from './column';

export class ListRow extends PureComponent {
    renderListExtra() {
        return null;
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
        const { page, row, deleteRow } = this.props;

        const deleteBtn = <span className="delete">
            <a onClick={() => deleteRow()}>&minus;</a>
        </span>;

        const items = PAGES[page].cols.map(
            (colName, colKey) => <Column key={colKey}
                page={page}
                row={this.props.row}
                colName={colName}
                colKey={colKey}
                id={this.props.id}
                active={this.props.activeCol === colKey}
            />
        );

        const itemClassName = classNames({
            ...this.listItemClasses(),
            future: row.get('future'),
            'first-present': row.get('first-present')
        });

        return <li className={itemClassName}>
            {items}
            {this.dailyText()}
            {this.renderListExtra()}
            {deleteBtn}
        </li>;
    }
}

ListRow.propTypes = {
    page: PropTypes.string.isRequired,
    id: PropTypes.number.isRequired,
    row: PropTypes.instanceOf(map).isRequired,
    activeCol: PropTypes.number,
    daily: PropTypes.number,
    getDaily: PropTypes.bool.isRequired,
    deleteRow: PropTypes.func.isRequired
};

const stateDefault = page => (state, ownProps) => ({
    page,
    row: state.getIn(['pages', page, 'rows', ownProps.id]),
    activeCol: state.getIn(['edit', 'active', 'row']) === ownProps.id
        ? state.getIn(['edit', 'active', 'col'])
        : null,
    getDaily: Boolean(PAGES[page].daily)
});

const dispatchDefault = page => (dispatch, ownProps) => ({
    deleteRow: () => dispatch(aListItemDeleted({ page, id: ownProps.id }))
});

export const ListRowContainer = page =>
    extendableContainer(stateDefault, dispatchDefault)(page)()(ListRow);

export default extendableContainer(stateDefault, dispatchDefault);

