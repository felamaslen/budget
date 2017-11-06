/**
 * Analysis page component
 */

import { List as list } from 'immutable';
import { connect } from 'react-redux';

import { aKeyPressed } from '../../../actions/app.actions';
import { aContentRequested, aContentBlockHovered } from '../../../actions/content.actions';
import {
    aOptionChanged, aBlockClicked,
    aTreeItemDisplayToggled, aTreeItemExpandToggled, aTreeItemHovered
} from '../../../actions/analysis.actions';

import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';

import Page from '../../../components/page';
import Timeline from './timeline'

import { PAGES, ANALYSIS_PERIODS, ANALYSIS_GROUPINGS } from '../../../misc/const';
import { formatCurrency, capitalise } from '../../../misc/format';

import BlockPacker from '../../../components/block-packer';

const pageIndex = PAGES.indexOf('analysis');

export class PageAnalysis extends Page {
    loadContent() {
        this.props.loadContent({
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

        return <li className="tree-list-item head">
            <div className="inner">
                <span className="indicator" />

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
        </li>;
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
                onMouseOver={onMouseOver} onMouseOut={onMouseOut}
                onTouchStart={onMouseOver} onTouchEnd={onMouseOut}>

                <div className="main">
                    <span className="title">{subItemName}</span>
                    <span className="cost">{formatCurrency(subItemTotal)}</span>
                    <span className="pct">&nbsp;({subItemPct}%)</span>
                </div>
            </li>;
        });

        return <ul className="sub-tree">
            {subTreeItems}
        </ul>;
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
                [`tree-list-item ${item.name}`]: true,
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

                    <span className="indicator" />
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
            <ul className="tree-list">
                {listTreeHead}
                {listTreeBody}
            </ul>
        </div>;
    }
    changePeriod(periodKey) {
        return this.props.changeOption(
            periodKey, this.props.grouping, 0
        );
    }
    changeGrouping(groupingKey) {
        return this.props.changeOption(
            this.props.period, groupingKey, this.props.timeIndex
        );
    }
    changeTimeIndex(delta) {
        return this.props.changeOption(
            this.props.period, this.props.grouping, this.props.timeIndex + delta
        );
    }
    previousPeriod() {
        return this.changeTimeIndex(1);
    }
    nextPeriod() {
        return this.changeTimeIndex(-1);
    }
    render() {
        if (!this.props.loaded) {
            return null;
        }

        const listTree = this.listTree();

        let timeline = null
        if (this.props.timeline) {
            timeline = <Timeline data={this.props.timeline} />
        }

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
                    <span>{'Period:'}</span>
                    {periodSwitcher}
                </span>
                <span className="input-grouping">
                    <span>{'Grouping:'}</span>
                    {groupingSwitcher}
                </span>
                <div className="btns">
                    <button className="btn-previous"
                        onClick={() => this.previousPeriod()}>Previous</button>
                    <button className="btn-next" disabled={this.props.timeIndex === 0}
                        onClick={() => this.nextPeriod()}>Next</button>
                </div>
                <h3 className="period-title">{this.props.description}</h3>
                <div className="analysis-outer">
                    {timeline}
                    {listTree}
                    <BlockPacker
                        pageIndex={this.props.pageIndex}
                        activeBlock={this.props.activeBlock}
                        blocks={this.props.blocks}
                        deepBlock={this.props.deepBlock}
                        status={this.props.blockStatus}
                        onClick={this.props.onBlockClick}
                        onHover={this.props.onBlockHover} />
                </div>
            </div>
        </div>;
    }
}

PageAnalysis.propTypes = {
    loaded: PropTypes.bool.isRequired,
    period: PropTypes.number.isRequired,
    grouping: PropTypes.number.isRequired,
    cost: PropTypes.instanceOf(list),
    costTotal: PropTypes.number,
    description: PropTypes.string,
    treeVisible: PropTypes.object.isRequired,
    treeOpen: PropTypes.object.isRequired,
    timeIndex: PropTypes.number.isRequired,
    timeline: PropTypes.instanceOf(list),
    blocks: PropTypes.instanceOf(list),
    activeBlock: PropTypes.array,
    deepBlock: PropTypes.string,
    blockStatus: PropTypes.string,
    changeOption: PropTypes.func.isRequired,
    loadContent: PropTypes.func.isRequired,
    onToggleTreeItem: PropTypes.func.isRequired,
    onHoverTreeItem: PropTypes.func.isRequired,
    onExpandTreeItem: PropTypes.func.isRequired,
    onBlockClick: PropTypes.func.isRequired,
    onBlockHover: PropTypes.func.isRequired
};

const mapStateToProps = state => ({
    pageIndex,
    loaded: Boolean(state.getIn(['pagesLoaded', pageIndex])),
    treeVisible: state.getIn(['other', 'analysis', 'treeVisible']),
    treeOpen: state.getIn(['other', 'analysis', 'treeOpen']),
    period: state.getIn(['other', 'analysis', 'period']),
    grouping: state.getIn(['other', 'analysis', 'grouping']),
    timeIndex: state.getIn(['other', 'analysis', 'timeIndex']),
    timeline: state.getIn(['other', 'analysis', 'timeline']),
    cost: state.getIn(['pages', pageIndex, 'cost']),
    costTotal: state.getIn(['pages', pageIndex, 'costTotal']),
    description: state.getIn(['pages', pageIndex, 'description']),
    activeBlock: state.getIn(['other', 'blockView', 'active']),
    blocks: state.getIn(['other', 'blockView', 'blocks']),
    deepBlock: state.getIn(['other', 'blockView', 'deep']),
    blockStatus: state.getIn(['other', 'blockView', 'status'])
});

const mapDispatchToProps = dispatch => ({
    handleKeyPress: req => dispatch(aKeyPressed(req)),
    changeOption: (period, grouping, timeIndex) => dispatch(aOptionChanged(
        { pageIndex, period, grouping, timeIndex }
    )),
    loadContent: req => dispatch(aContentRequested(req)),
    onToggleTreeItem: name => dispatch(aTreeItemDisplayToggled(name)),
    onHoverTreeItem: req => dispatch(aTreeItemHovered(req)),
    onExpandTreeItem: name => dispatch(aTreeItemExpandToggled(name)),
    onBlockClick: req => dispatch(aBlockClicked(req)),
    onBlockHover: (block, subBlock) => dispatch(aContentBlockHovered({ block, subBlock }))
});

export default connect(mapStateToProps, mapDispatchToProps)(PageAnalysis);

