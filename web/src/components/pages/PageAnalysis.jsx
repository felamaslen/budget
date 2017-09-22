/**
 * Analysis page component
 */

import { List as list, Map as map } from 'immutable';
import { connect } from 'react-redux';

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { PAGES, ANALYSIS_PERIODS, ANALYSIS_GROUPINGS } from '../../misc/const';
import { formatCurrency, capitalise } from '../../misc/format';
import {
    aPeriodChanged, aGroupingChanged, aTimeIndexChanged,
    aTreeItemDisplayToggled, aTreeItemExpandToggled, aTreeItemHovered
} from '../../actions/AnalysisActions';
import BlockPacker from '../BlockPacker';

export class PageAnalysis extends Component {
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

            return (
                <li key={subKey} className="tree-list-item"
                    onMouseOver={() => this.dispatchAction(aTreeItemHovered([item.name, subItemName]))}
                    onMouseOut={() => this.dispatchAction(aTreeItemHovered(null))}>

                    <div className="main">
                        <span className="title">{subItemName}</span>
                        <span className="cost">{formatCurrency(subItemTotal)}</span>
                        <span className="pct">&nbsp;({subItemPct}%)</span>
                    </div>
                </li>
            );
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

            const onToggle = () => this.dispatchAction(aTreeItemDisplayToggled(item.name));

            return (
                <li key={key} className={classes}>
                    <div className="main"
                        onClick={() => this.dispatchAction(aTreeItemExpandToggled(item.name))}
                        onMouseOver={() => this.dispatchAction(aTreeItemHovered([item.name]))}
                        onMouseOut={() => this.dispatchAction(aTreeItemHovered(null))}>
                        <input type="checkbox" checked={item.visible} onChange={onToggle} />
                        <span className="title">{item.name}</span>
                        <span className="cost">{formatCurrency(item.cost)}</span>
                        <span className="pct">&nbsp;({item.pct.toFixed(1)}%)</span>
                    </div>
                    {subTree}
                </li>
            );
        })

        return <div className="tree">
            <ul className="tree-list flex">
                {listTreeHead}
                {listTreeBody}
            </ul>
        </div>;
    }
    render() {
        const listTree = this.listTree();

        const periodSwitcher = ANALYSIS_PERIODS.map((period, key) => <span key={key}>
            <input type="radio" checked={this.props.period === key}
                onChange={() => this.props.changePeriod(key)} />
            <span>{capitalise(period)}</span>
        </span>);

        const groupingSwitcher = ANALYSIS_GROUPINGS.map((grouping, key) => <span key={key}>
            <input type="radio" checked={this.props.grouping === key}
                onChange={() => this.props.changeGrouping(key)} />
            <span>{capitalise(grouping)}</span>
        </span>);

        const previousPeriod = () => this.props.previousPeriod(this.props.timeIndex);
        const nextPeriod = () => this.props.nextPeriod(this.props.timeIndex);

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
                        onClick={previousPeriod}>Previous</button>
                    <button className="btn-next" disabled={this.props.timeIndex === 0}
                        onClick={nextPeriod}>Next</button>
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
    period: PropTypes.string.isRequired,
    grouping: PropTypes.string.isRequired,
    cost: PropTypes.instanceOf(list),
    costTotal: PropTypes.number,
    items: PropTypes.instanceOf(map),
    description: PropTypes.string,
    blocks: PropTypes.instanceOf(map),
    treeVisible: PropTypes.bool.isRequired,
    treeOpen: PropTypes.bool.isRequired,
    timeIndex: PropTypes.number.isRequired,
    deep: PropTypes.string.isRequired,
    status: PropTypes.string.isRequired,
    changePeriod: PropTypes.func.isRequired,
    changeGrouping: PropTypes.func.isRequired,
    nextPeriod: PropTypes.func.isRequired,
    previousPeriod: PropTypes.func.isRequired
};

const mapStateToProps = state => {
    const pageIndex = PAGES.indexOf('analysis');

    return {
        treeVisible: state.getIn(['global', 'other', 'analysis', 'treeVisible']),
        treeOpen: state.getIn(['global', 'other', 'analysis', 'treeOpen']),
        timeIndex: state.getIn(['global', 'other', 'analysis', 'timeIndex']),
        period: state.getIn(['global', 'other', 'analysis', 'period']),
        grouping: state.getIn(['global', 'other', 'analysis', 'grouping']),
        blocks: state.getIn(['global', 'other', 'blockView', 'blocks']),
        status: state.getIn(['global', 'other', 'blockView', 'status']),
        deep: state.getIn(['global', 'other', 'blockView', 'deep']),
        cost: state.getIn(['global', 'pages', pageIndex, 'cost']),
        costTotal: state.getIn(['global', 'pages', pageIndex, 'costTotal']),
        description: state.getIn(['global', 'pages', pageIndex, 'description'])
    };
};

const mapDispatchToProps = dispatch => ({
    changePeriod: key => dispatch(aPeriodChanged(key)),
    changeGrouping: key => dispatch(aGroupingChanged(key)),
    nextPeriod: timeIndex => dispatch(aTimeIndexChanged(timeIndex - 1)),
    previousPeriod: timeIndex => dispatch(aTimeIndexChanged(timeIndex + 1))
});

export default connect(mapStateToProps, mapDispatchToProps)(PageAnalysis);

