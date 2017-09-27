/**
 * List page component
 */

import { List as list } from 'immutable';
import { connect as reduxConnect } from 'react-redux';

import { aContentRequested } from '../../actions/ContentActions';
import { aListItemAdded, aListItemDeleted } from '../../actions/EditActions';
import {
    aMobileEditDialogOpened,
    aMobileAddDialogOpened
} from '../../actions/FormActions';

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import Media from 'react-media';
import { mediaQueries, PAGES, DAILY_PAGES, LIST_COLS_PAGES } from '../../misc/const';
import { formatCurrency } from '../../misc/format';
import getEditable from '../Editable';
import ListAddEditItem from '../ListAddEditItem';

export class PageList extends Component {
    constructor(props) {
        super(props);

        this.addItems = [];
    }
    addItem() {
        this.props.addListItem(this.props.pageIndex);
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
        const weeklyValue = formatCurrency(this.props.weeklyValue, {
            abbreviate: true,
            precision: 1
        });

        const daily = this.props.daily
            ? <span>
                <span className="daily">Daily</span>
                <span className="weekly">Weekly:</span>
                <span className="weekly-value">{weeklyValue}</span>
            </span>
            : null;

        const totalValue = formatCurrency(this.props.totalCost, {
            abbreviate: true,
            precision: 1
        });

        return (
            <div className="list-head noselect">
                {this.renderListHeadMain(LIST_COLS_PAGES[this.props.pageIndex])}
                {daily}
                <span className="total">Total:</span>
                <span className="total-value">{totalValue}</span>
                {this.listHeadExtra()}
            </div>
        );
    }
    renderLiAdd() {
        const addItems = LIST_COLS_PAGES[this.props.pageIndex].map((item, col) => {
            const ref = editable => {
                this.addItems.push(editable);
            };

            return <ListAddEditItem pageIndex={this.props.pageIndex}
                key={col} ref={ref} row={-1} col={col} id={null}
                noSuggestions={this.props.noSuggestions} />;
        });

        const addBtnOnClick = () => this.addItem();
        const addBtnRef = input => {
            this.addBtn = input;
        };

        return <li className="li-add">
            {addItems}
            <span>
                <button ref={addBtnRef} onClick={addBtnOnClick}>Add</button>
            </span>
        </li>;
    }
    renderListExtra() {
        return null;
    }
    listItemClasses() {
        return {};
    }
    renderListItem(rowKey, colKey, id, item, value, active = false) {
        const Editable = getEditable({ row: rowKey, col: colKey, id, item, value });

        const spanClasses = classNames({
            [item]: true,
            active
        });

        return <span key={colKey} className={spanClasses}>
            <Editable noSuggestions={this.props.noSuggestions}
                pageIndex={this.props.pageIndex} />
        </span>;
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

        const onClick = () => this.props.openMobileEditDialog(rowKey);

        return <li onClick={onClick} key={rowKey}>{items}</li>;
    }
    renderAddButton() {
        const onClick = () => this.props.openMobileAddDialog();

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
            .map(column => LIST_COLS_PAGES[this.props.pageIndex].indexOf(column));

        const rows = this.props.rows.map(
            (row, rowKey) => this.renderListRowMobile(row, rowKey, columns, colKeys)
        );

        return <div>
            {this.renderListHeadMobile(columns)}
            <ul className="list-ul">{rows}</ul>
            {this.renderAddButton()}
        </div>;
    }
    renderListRowDesktop(row, rowKey) {
        const id = row.get('id');

        const onDelete = () => {
            this.dispatchAction(aListItemDeleted({
                pageIndex: this.props.pageIndex,
                key: rowKey
            }));
        };

        const deleteBtn = <span className="delete">
            <a onClick={onDelete}>&minus;</a>
        </span>;

        const items = LIST_COLS_PAGES[this.props.pageIndex].map((column, colKey) => {
            const value = row.getIn(['cols', colKey]);
            const active = this.props.editRow === rowKey &&
                this.props.editCol === colKey;

            return this.renderListItem(rowKey, colKey, id, column, value, active);
        });

        const dailyText = this.props.daily && row.has('daily')
            ? formatCurrency(row.get('daily'))
            : null;
        const daily = this.props.daily
            ? <span className="daily">{dailyText}</span>
            : null;

        const itemClasses = this.listItemClasses(row);
        itemClasses.future = row.get('future');
        itemClasses['first-present'] = row.get('first-present');

        return <li key={rowKey} className={classNames(itemClasses)}>
            {items}
            {daily}
            {this.renderListExtra(row, rowKey)}
            {deleteBtn}
        </li>;
    }
    renderListDesktop(render) {
        if (!render) {
            return null;
        }

        const rows = this.props.rows.map(
            (row, rowKey) => this.renderListRowDesktop(row, rowKey)
        );

        return <div>
            {this.renderListHeadDesktop()}
            <ul className="list-ul">
                {this.renderLiAdd()}
                {rows}
            </ul>
        </div>;
    }
    renderList() {
        return <div>
            <Media query={mediaQueries.mobile}>{render => this.renderListMobile(render)}</Media>
            <Media query={mediaQueries.desktop}>{render => this.renderListDesktop(render)}</Media>
        </div>;
    }
    afterList() {
        return null;
    }
    componentDidMount() {
        if (!this.props.loaded) {
            this.props.loadContent({ pageIndex: this.props.pageIndex });
        }
    }
    shouldComponentUpdate(nextProps) {
        const pageLoaded = !this.props.loaded && nextProps.loaded;
        const addBtnFocus = !this.props.addBtnFocus && nextProps.addBtnFocus;

        if (addBtnFocus && this.addBtn) {
            setTimeout(() => this.addBtn.focus(), 0);

            return false;
        }

        return pageLoaded;
    }
    render() {
        if (!this.props.loaded) {
            return null;
        }

        const listClasses = [
            'list-insert',
            `list-${PAGES[this.props.pageIndex]}`,
            'list'
        ].join(' ');

        const listRendered = this.renderList();
        const afterList = this.afterList();

        const pageClasses = `page-${PAGES[this.props.pageIndex]}`;

        return <div className={pageClasses}>
            <div className={listClasses}>
                {listRendered}
            </div>
            {afterList}
        </div>;
    }
}

PageList.propTypes = {
    pageIndex: PropTypes.number.isRequired,
    noSuggestions: PropTypes.bool.isRequired,
    loaded: PropTypes.bool.isRequired,
    rows: PropTypes.instanceOf(list),
    totalCost: PropTypes.number,
    weeklyValue: PropTypes.number,
    editRow: PropTypes.number,
    editCol: PropTypes.number,
    addBtnFocus: PropTypes.bool,
    daily: PropTypes.bool,
    addListItem: PropTypes.func.isRequired,
    loadContent: PropTypes.func.isRequired,
    openMobileEditDialog: PropTypes.func.isRequired,
    openMobileAddDialog: PropTypes.func.isRequired
};

function getStateProps(pageIndex, extra) {
    const mapStateToPropsDefault = state => ({
        pageIndex,
        noSuggestions: ['funds'].indexOf(PAGES[pageIndex]) !== -1,
        loaded: Boolean(state.getIn(['global', 'pagesLoaded', pageIndex])),
        rows: state.getIn(['global', 'pages', pageIndex, 'rows']),
        totalCost: state.getIn(['global', 'pages', pageIndex, 'data', 'total']),
        weeklyValue: state.getIn(['global', 'pages', pageIndex, 'data', 'weekly']),
        editRow: state.getIn(['global', 'edit', 'row']),
        editCol: state.getIn(['global', 'edit', 'col']),
        addBtnFocus: state.getIn(['global', 'edit', 'addBtnFocus']),
        daily: DAILY_PAGES[pageIndex]
    });

    if (extra) {
        return (state, ownProps) => Object.assign(
            mapStateToPropsDefault(state, ownProps),
            extra(state, ownProps)
        );
    }

    return mapStateToPropsDefault;
}

function getDispatchProps(pageIndex, extra) {
    const mapDispatchToPropsDefault = dispatch => ({
        addListItem: () => dispatch(aListItemAdded(pageIndex)),
        loadContent: req => dispatch(aContentRequested(req)),
        openMobileEditDialog: rowKey => dispatch(
            aMobileEditDialogOpened(pageIndex, rowKey)
        ),
        openMobileAddDialog: () => dispatch(aMobileAddDialogOpened(pageIndex))
    });

    if (extra) {
        return (dispatch, ownProps) => Object.assign(
            mapDispatchToPropsDefault(dispatch, ownProps),
            extra(dispatch, ownProps)
        );
    }

    return mapDispatchToPropsDefault;
}

export function connect(pageIndex, extraState = null, extraDispatch = null) {
    const mapStateToProps = getStateProps(pageIndex, extraState);
    const mapDispatchToProps = getDispatchProps(pageIndex, extraDispatch);

    return reduxConnect(mapStateToProps, mapDispatchToProps);
}

export default pageIndex => connect(pageIndex)(PageList);

