/**
 * Analysis page component
 */

import { List as list, Map as map } from 'immutable';
import { connect } from 'react-redux';

import { aContentRequested } from '../../actions/ContentActions';

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { PAGES, ANALYSIS_PERIODS, ANALYSIS_GROUPINGS } from '../../misc/const';
import { formatCurrency, capitalise } from '../../misc/format';
import {
    aOptionChanged,
    aTreeItemDisplayToggled, aTreeItemExpandToggled, aTreeItemHovered
} from '../../actions/AnalysisActions';
import BlockPacker from '../BlockPacker';

const pageIndex = PAGES.indexOf('analysis');

export class PageAnalysis extends Component {
    componentDidMount() {
        this.props.loadContent({
            apiKey: this.props.apiKey,
            pageIndex,
            params: [
                ANALYSIS_PERIODS[this.props.period],
                ANALYSIS_GROUPINGS[this.props.grouping],
                this.props.timeIndex
            ]
        });
    }
    format(value, abbreviate) {
        return formatCurrency(value, { abbreviate, precision: 1 });
    }
    listTreeHead(items) {
        const getCost = itemList => {
            return formatCurrency(
                itemList.reduce((last, item) => last + item.cost, 0)
            );
        };

        const getPct = itemList => {
            return itemList
                .reduce((last, item) => last + item.pct, 0)
                .toFixed(1);
        };

        const itemsSelected = items.filter(item => item.visible);

        const costTotal = getCost(items);
        const pctTotal = getPct(items);

        const costSelected = getCost(itemsSelected);
        const pctSelected = getPct(itemsSelected);

        return (
            <li className="tree-list-item head">
                <div className="inner">
                    <span className="title">Total:</span>
                    <span className="cost">
                        <div className="total">{costTotal}</div>
                        <div className="selected">{costSelected}</div>
                    </span>
                    <span className="pct">
                        <div className="total">{pctTotal}%</div>
                        <div className="selected">{pctSelected}%</div>
                    </span>
                </div>
            </li>
        );
    }
    subTree(item) {
        if (!item.open) {
            return null;
        }

        const subTreeItems = item.subTree.map((subItem, subKey) => {
            const subItemTotal = subItem.get('total');
            const subItemPct = (100 * subItemTotal / item.cost).toFixed(1);
            const subItemName = subItem.get('name');

            const onMouseOver = () => this.props.onHoverTreeItem([item.name, subItemName]);
            const onMouseOut = () => this.props.onHoverTreeItem(null);

            return <li key={subKey} className="tree-list-item"
                onMouseOver={onMouseOver} onMouseOut={onMouseOut}>

                <div className="main">
                    <span className="title">{subItemName}</span>
                    <span className="cost">{formatCurrency(subItemTotal)}</span>
                    <span className="pct">&nbsp;({subItemPct}%)</span>
                </div>
            </li>;
        });

        return (
            <ul className="sub-tree">
                {subTreeItems}
            </ul>
        );
    }
    listTree() {
        const costPct = this.props.cost.map(item => {
            const cost = item.get('total');
            const pct = 100 * cost / this.props.costTotal;
            const name = item.get('name');
            const visible = this.props.treeVisible.has(name)
                ? this.props.treeVisible.get(name)
                : true;

            const open = Boolean(this.props.treeOpen.get(name));

            const subTree = item.get('subTree');

            return { name, cost, pct, visible, open, subTree };
        });

        const listTreeHead = this.listTreeHead(costPct);

        const listTreeBody = costPct.map((item, key) => {
            const classes = classNames({
                'tree-list-item': true,
                open: item.open
            });

            const subTree = this.subTree(item);

            const onClick = () => this.props.onExpandTreeItem(item.name);
            const onMouseOver = () => this.props.onHoverTreeItem([item.name]);
            const onMouseOut = () => this.props.onHoverTreeItem(null);

            const onToggle = () => this.props.onToggleTreeItem(item.name);
            const stopPropagation = evt => evt.stopPropagation();

            return <li key={key} className={classes}>
                <div className="main"
                    onClick={onClick} onMouseOver={onMouseOver} onMouseOut={onMouseOut}>

                    <input type="checkbox" checked={item.visible} onClick={stopPropagation}
                        onChange={onToggle} />
                    <span className="title">{item.name}</span>
                    <span className="cost">{formatCurrency(item.cost)}</span>
                    <span className="pct">&nbsp;({item.pct.toFixed(1)}%)</span>
                </div>
                {subTree}
            </li>;
        })

        return <div className="tree">
            <ul className="tree-list flex">
                {listTreeHead}
                {listTreeBody}
            </ul>
        </div>;
    }
    changePeriod(periodKey) {
        return this.props.changeOption(
            this.props.apiKey, periodKey, this.props.grouping, 0
        );
    }
    changeGrouping(groupingKey) {
        return this.props.changeOption(
            this.props.apiKey, this.props.period, groupingKey, this.props.timeIndex
        );
    }
    changeTimeIndex(delta) {
        return this.props.changeOption(
            this.props.apiKey, this.props.period, this.props.grouping, this.props.timeIndex + delta
        );
    }
    previousPeriod() {
        return this.changeTimeIndex(1);
    }
    nextPeriod() {
        return this.changeTimeIndex(-1);
    }
    render() {
        if (!this.props.active) {
            return null;
        }

        const listTree = this.listTree();

        const periodSwitcher = ANALYSIS_PERIODS.map((period, key) => <span key={key}>
            <input type="radio" checked={this.props.period === key}
                onChange={() => this.changePeriod(key)} />
            <span>{capitalise(period)}</span>
        </span>);

        const groupingSwitcher = ANALYSIS_GROUPINGS.map((grouping, key) => <span key={key}>
            <input type="radio" checked={this.props.grouping === key}
                onChange={() => this.changeGrouping(key)} />
            <span>{capitalise(grouping)}</span>
        </span>);

        return <div className="page-analysis">
            <div className="upper">
                <span className="input-period">
                    <span>Period:</span>
                    {periodSwitcher}
                </span>
                <span className="input-grouping">
                    <span>Grouping:</span>
                    {groupingSwitcher}
                </span>
                <div className="btns">
                    <button className="btn-previous"
                        onClick={() => this.previousPeriod()}>Previous</button>
                    <button className="btn-next" disabled={this.props.timeIndex === 0}
                        onClick={() => this.nextPeriod()}>Next</button>
                </div>
                <h3 className="period-title">{this.props.description}</h3>
                <div className="flexbox">
                    {listTree}
                    <BlockPacker />
                </div>
            </div>
        </div>;
    }
}

PageAnalysis.propTypes = {
    active: PropTypes.bool.isRequired,
    apiKey: PropTypes.string.isRequired,
    period: PropTypes.number.isRequired,
    grouping: PropTypes.number.isRequired,
    cost: PropTypes.instanceOf(list),
    costTotal: PropTypes.number,
    items: PropTypes.instanceOf(map),
    description: PropTypes.string,
    blocks: PropTypes.instanceOf(list),
    treeVisible: PropTypes.object.isRequired,
    treeOpen: PropTypes.object.isRequired,
    timeIndex: PropTypes.number.isRequired,
    deep: PropTypes.string,
    status: PropTypes.string.isRequired,
    changeOption: PropTypes.func.isRequired,
    loadContent: PropTypes.func.isRequired,
    onToggleTreeItem: PropTypes.func.isRequired,
    onHoverTreeItem: PropTypes.func.isRequired,
    onExpandTreeItem: PropTypes.func.isRequired
};

const mapStateToProps = state => ({
    apiKey: state.getIn(['global', 'user', 'apiKey']),
    active: Boolean(state.getIn(['global', 'pagesLoaded', pageIndex])),
    treeVisible: state.getIn(['global', 'other', 'analysis', 'treeVisible']),
    treeOpen: state.getIn(['global', 'other', 'analysis', 'treeOpen']),
    period: state.getIn(['global', 'other', 'analysis', 'period']),
    grouping: state.getIn(['global', 'other', 'analysis', 'grouping']),
    timeIndex: state.getIn(['global', 'other', 'analysis', 'timeIndex']),
    blocks: state.getIn(['global', 'other', 'blockView', 'blocks']),
    status: state.getIn(['global', 'other', 'blockView', 'status']),
    deep: state.getIn(['global', 'other', 'blockView', 'deep']),
    cost: state.getIn(['global', 'pages', pageIndex, 'cost']),
    costTotal: state.getIn(['global', 'pages', pageIndex, 'costTotal']),
    description: state.getIn(['global', 'pages', pageIndex, 'description'])
});

const mapDispatchToProps = dispatch => ({
    changeOption: (apiKey, period, grouping, timeIndex) => dispatch(aOptionChanged(
        { apiKey, pageIndex, period, grouping, timeIndex }
    )),
    loadContent: req => dispatch(aContentRequested(req)),
    onToggleTreeItem: name => dispatch(aTreeItemDisplayToggled(name)),
    onHoverTreeItem: req => dispatch(aTreeItemHovered(req)),
    onExpandTreeItem: name => dispatch(aTreeItemExpandToggled(name))
});

export default connect(mapStateToProps, mapDispatchToProps)(PageAnalysis);

