/**
 * List page component
 */

import React from 'react';
import PropTypes from 'prop-types';
import PureControllerView from '../PureControllerView';
import { List as list, Map as map } from 'immutable';
import classNames from 'classnames';
import Media from 'react-media';
import { mediaQueries, LIST_COLS_PAGES } from '../../misc/const';
import { formatCurrency } from '../../misc/format';
import getEditable from '../Editable';
import { aListItemAdded, aListItemDeleted } from '../../actions/EditActions';
import {
    aMobileEditDialogOpened,
    aMobileAddDialogOpened
} from '../../actions/FormActions';

export class PageList extends PureControllerView {
    addItem() {
        this.dispatchAction(aListItemAdded(this.addItems));
    }
    listHeadExtra() {
        return null;
    }
    renderListHeadMain(columns) {
        return columns.map((column, key) => {
            return <span key={key} className={column}>{column}</span>;
        });
    }
    renderListHeadMobile(columns) {
        return (
            <div className="list-head noselect">
                {this.renderListHeadMain(columns)}
            </div>
        );
    }
    renderListHeadDesktop() {
        const weeklyValue = formatCurrency(this.props.data.getIn(
            ['data', 'weekly']
        ), {
            abbreviate: true,
            precision: 1
        });

        const daily = this.props.daily
            ? (
                <span>
                    <span className="daily">Daily</span>
                    <span className="weekly">Weekly:</span>
                    <span className="weekly-value">{weeklyValue}</span>
                </span>
            )
            : null;

        const totalValue = formatCurrency(this.props.data.getIn(
            ['data', 'total']
        ), {
            abbreviate: true,
            precision: 1
        });

        return (
            <div className="list-head noselect">
                {this.renderListHeadMain(LIST_COLS_PAGES[this.props.index])}
                {daily}
                <span className="total">Total:</span>
                <span className="total-value">{totalValue}</span>
                {this.listHeadExtra()}
            </div>
        );
    }
    renderLiAdd() {
        this.addItems = [];

        const addRow = LIST_COLS_PAGES[this.props.index].map((column, key) => {
            const value = this.props.add.get(key);
            const active = this.props.edit.get('row') === -1 && this.props.edit.get('col') === key;
            const editItem = getEditable(
                this.props.dispatcher, -1, key, null, column, value,
                this.props.index, active, this.props.suggestions
            );
            this.addItems.push(editItem);

            const spanClasses = classNames({
                [column]: true,
                active
            });

            return (
                <span key={key} className={spanClasses}>
                    {editItem}
                </span>
            );
        });

        const addBtnOnClick = () => this.addItem();
        const addBtnRef = () => {
            return btn => {
                this.addBtn = btn;
            };
        };

        return (
            <li className="li-add">
                {addRow}
                <span>
                    <button ref={addBtnRef()} onClick={addBtnOnClick}>Add</button>
                </span>
            </li>
        );
    }
    renderListExtra() {
        return null;
    }
    listItemClasses() {
        return {};
    }
    renderListItem(rowKey, colKey, id, column, value, active = false) {
        const editItem = getEditable(
            this.props.dispatcher, rowKey, colKey, id, column, value,
            this.props.index, active, this.props.suggestions
        );

        const spanClasses = classNames({
            [column]: true,
            active
        });

        return (
            <span key={colKey} className={spanClasses}>
                {editItem}
            </span>
        );
    }
    renderListRowItemsMobile(row, rowKey, columns, colKeys) {
        const id = row.get('id');

        return columns
            .map((column, key) => {
                const colKey = colKeys[key];
                const value = row.getIn(['cols', colKey]);

                return this.renderListItem(rowKey, colKey, id, column, value);
            });
    }
    renderListRowMobile(row, rowKey, columns, colKeys) {
        const items = this.renderListRowItemsMobile(row, rowKey, columns, colKeys);

        const onClick = () => {
            this.dispatchAction(aMobileEditDialogOpened(this.props.index, rowKey));
        };

        return <li onClick={onClick} key={rowKey}>{items}</li>;
    }
    renderAddButton() {
        const onClick = () => this.dispatchAction(aMobileAddDialogOpened(this.props.index));

        return <div className="button-add-outer">
            <button type="button" className="button-add" onClick={onClick}>
                Add
            </button>
        </div>;
    }
    renderListMobile(render) {
        if (!render) {
            return null;
        }

        const columns = ['date', 'item', 'cost'];
        const colKeys = columns
            .map(column => LIST_COLS_PAGES[this.props.index].indexOf(column));

        const rows = this.props.data.get('rows')
            .map((row, rowKey) => this.renderListRowMobile(row, rowKey, columns, colKeys));

        return (
            <div>
                {this.renderListHeadMobile(columns)}
                <ul className="list-ul">{rows}</ul>
                {this.renderAddButton()}
            </div>
        );
    }
    renderListRowDesktop(row, rowKey) {
        const id = row.get('id');

        const onClick = () => {
            this.dispatchAction(aListItemDeleted({
                pageIndex: this.props.index,
                key: rowKey
            }));
        };

        const deleteBtn = (
            <span className="delete">
                <a onClick={onClick}>&minus;</a>
            </span>
        );

        const items = LIST_COLS_PAGES[this.props.index].map((column, colKey) => {
            const value = row.getIn(['cols', colKey]);
            const active = this.props.edit.get('row') === rowKey && this.props.edit.get('col') === colKey;

            return this.renderListItem(rowKey, colKey, id, column, value, active);
        });

        const dailyText = this.props.daily && row.has('daily')
            ? formatCurrency(row.get('daily'))
            : null;
        const daily = this.props.daily ? (
            <span className="daily">{dailyText}</span>
        ) : null;

        const itemClasses = this.listItemClasses(row);
        itemClasses.future = row.get('future');
        itemClasses['first-present'] = row.get('first-present');

        return (
            <li key={rowKey} className={classNames(itemClasses)}>
                {items}
                {daily}
                {this.renderListExtra(row, rowKey)}
                {deleteBtn}
            </li>
        );
    }
    renderListDesktop(render) {
        if (!render) {
            return null;
        }

        const rows = this.props.data.get('rows')
            .map((row, rowKey) => this.renderListRowDesktop(row, rowKey));

        return (
            <div>
                {this.renderListHeadDesktop()}
                <ul className="list-ul">
                    {this.renderLiAdd()}
                    {rows}
                </ul>
            </div>
        );
    }
    renderList() {
        return (
            <div>
                <Media query={mediaQueries.mobile}>{render => this.renderListMobile(render)}</Media>
                <Media query={mediaQueries.desktop}>{render => this.renderListDesktop(render)}</Media>
            </div>
        );
    }
    componentDidUpdate(prevProps) {
        if (!prevProps.addBtnFocus && this.props.addBtnFocus && this.addBtn) {
            window.setTimeout(() => {
                this.addBtn.focus();
            }, 0);
        }
    }
    afterList() {
        return null;
    }
    render() {
        const listClasses = [
            'list-insert',
            `list-${this.props.page}`,
            'list'
        ].join(' ');

        const listRendered = this.renderList();
        const afterList = this.afterList();

        return (
            <div>
                <div className={listClasses}>
                    {listRendered}
                </div>
                {afterList}
            </div>
        );
    }
}

PageList.propTypes = {
    data: PropTypes.instanceOf(map),
    edit: PropTypes.instanceOf(map),
    add: PropTypes.instanceOf(list),
    suggestions: PropTypes.instanceOf(map),
    addBtnFocus: PropTypes.bool,
    daily: PropTypes.bool,
    index: PropTypes.number,
    page: PropTypes.string,
    blocks: PropTypes.instanceOf(map)
};

