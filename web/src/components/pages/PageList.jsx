/**
 * List page component
 */

import React from 'react';
import PropTypes from 'prop-types';
import PureControllerView from '../PureControllerView';
import { List as list, Map as map } from 'immutable';
import classNames from 'classnames';
import { LIST_COLS_PAGES } from '../../misc/const';
import { formatCurrency } from '../../misc/format';
import { getEditable } from '../Editable/getEditable';
import { aListItemAdded, aListItemDeleted } from '../../actions/EditActions';
import { aContentBlockHovered } from '../../actions/ContentActions';
import { BlockViewShallow } from '../BlockPacker';

export class PageList extends PureControllerView {
    addItem() {
        this.dispatchAction(aListItemAdded(this.addItems));
    }
    listHeadExtra() {
        return null;
    }
    renderListHead() {
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

        const listHeadMain = LIST_COLS_PAGES[this.props.index].map((column, key) => {
            return <span key={key} className={column}>{column}</span>;
        });

        const totalValue = formatCurrency(this.props.data.getIn(
            ['data', 'total']
        ), {
            abbreviate: true,
            precision: 1
        });

        return (
            <div className="list-head noselect">
                {listHeadMain}
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
    renderList() {
        return this.props.data.get('rows').map((row, rowKey) => {
            const id = row.get('id');

            const deleteBtn = (
                <span className="delete">
                    <a onClick={() => {
                        this.dispatchAction(aListItemDeleted({
                            pageIndex: this.props.index,
                            key: rowKey
                        }));
                    }}>&minus;</a>
                </span>
            );

            const items = LIST_COLS_PAGES[this.props.index].map((column, colKey) => {
                const value = row.getIn(['cols', colKey]);
                const active = this.props.edit.get('row') === rowKey && this.props.edit.get('col') === colKey;
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
        });
    }
    componentDidUpdate(prevProps) {
        if (!prevProps.addBtnFocus && this.props.addBtnFocus && this.addBtn) {
            window.setTimeout(() => {
                this.addBtn.focus();
            }, 0);
        }
    }
    blockTree() {
        const blockClasses = 'block-tree flex shallow';

        return (
            <BlockViewShallow dispatcher={this.props.dispatcher}
                onBlockClick={() => null}
                onBlockHover={(block, subBlock) => {
                    this.dispatchAction(aContentBlockHovered(block, subBlock));
                }}
                blocks={this.props.blocks.get('blocks')}
                blockClasses={blockClasses}
                active={this.props.blocks.get('active')}
                status={this.props.blocks.get('status')}
            />
        );
    }
    afterList() {
        if (!this.props.blocks.get('blocks')) {
            return null;
        }

        return (
            <div className="graph-container-outer">
                {this.blockTree()}
            </div>
        );
    }
    render() {
        const listClasses = [
            'list-insert',
            `list-${this.props.page}`,
            'list'
        ].join(' ');

        return (
            <div>
                <div className={listClasses}>
                    {this.renderListHead()}
                    <ul className="list-ul">
                        {this.renderLiAdd()}
                        {this.renderList()}
                    </ul>
                </div>
                {this.afterList()}
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

