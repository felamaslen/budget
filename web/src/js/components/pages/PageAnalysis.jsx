/**
 * Analysis page component
 */

import { List as list, Map as map } from 'immutable';
import React from 'react';
import PropTypes from 'prop-types';
import PureControllerView from '../PureControllerView';
import classNames from 'classnames';
import { ANALYSIS_PERIODS, ANALYSIS_GROUPINGS } from '../../misc/const';
import { formatCurrency, capitalise } from '../../misc/format';
import {
  aPeriodChanged, aGroupingChanged, aTimeIndexChanged,
  aTreeItemDisplayToggled, aTreeItemExpandToggled, aTreeItemHovered,
  aBlockClicked
} from '../../actions/AnalysisActions';
import { aContentBlockHovered } from '../../actions/ContentActions';
import { BlockView } from '../BlockPacker';

export class PageAnalysis extends PureControllerView {
  format(value, abbreviate) {
    return formatCurrency(value, { abbreviate, precision: 1 });
  }
  listTreeHead(items) {
    const getCost = theList => {
      return formatCurrency(
        theList.reduce((last, item) => last + item.cost, 0)
      );
    };

    const getPct = theList => {
      return theList
        .reduce((last, item) => last + item.pct, 0)
        .toFixed(1);
    };

    const itemsSelected = items.filter(item => item.visible);

    const costTotal = getCost(items);
    const pctTotal = getPct(items);

    const costSelected = getCost(itemsSelected);
    const pctSelected = getPct(itemsSelected);

    return (
      <li className='tree-list-item head'>
        <div className='inner'>
          <span className='title'>Total:</span>
          <span className='cost'>
            <div className='total'>{costTotal}</div>
            <div className='selected'>{costSelected}</div>
          </span>
          <span className='pct'>
            <div className='total'>{pctTotal}%</div>
            <div className='selected'>{pctSelected}%</div>
          </span>
        </div>
      </li>
    );
  }
  listTree() {
    const costPct = this.props.cost.map(item => {
      const cost = item.get('total');
      const pct = 100 * cost / this.props.costTotal;
      const name = item.get('name');
      const visible = this.props.other.get('treeVisible').has(name) ?
        this.props.other.get('treeVisible').get(name) : true;

      const open = !!this.props.other.get('treeOpen').get(name);

      const subTree = item.get('subTree');

      return { name, cost, pct, visible, open, subTree };
    });

    const listTreeHead = this.listTreeHead(costPct);

    return (
      <div className='tree'>
        <ul className='tree-list flex'>
        {listTreeHead}
        {costPct.map((item, key) => {

          let subTree = null;

          if (item.open) {
            subTree = (
              <ul className='sub-tree'>
              {item.subTree.map((subItem, subKey) => {
                const subItemTotal = subItem.get('total');
                const subItemPct = (100 * subItemTotal / item.cost).toFixed(1);
                const subItemName = subItem.get('name');

                return (
                  <li key={subKey} className='tree-list-item'
                    onMouseOver={() => this.dispatchAction(aTreeItemHovered([item.name, subItemName]))}
                    onMouseOut={() => this.dispatchAction(aTreeItemHovered(null))}>
                    <div className='main'>
                      <span className='title'>{subItemName}</span>
                      <span className='cost'>{formatCurrency(subItemTotal)}</span>
                      <span className='pct'>&nbsp;({subItemPct}%)</span>
                    </div>
                  </li>
                );
              })}
              </ul>
            );
          }

          const classes = classNames({ 'tree-list-item': true, open });

          return (
            <li key={key} className={classes}>
              <div className='main'
                onClick={() => this.dispatchAction(aTreeItemExpandToggled(item.name))}
                onMouseOver={() => this.dispatchAction(aTreeItemHovered([item.name]))}
                onMouseOut={() => this.dispatchAction(aTreeItemHovered(null))}>
                <input type='checkbox' checked={item.visible}
                  onChange={() => this.dispatchAction(aTreeItemDisplayToggled(item.name))} />
                <span className='title'>{item.name}</span>
                <span className='cost'>{formatCurrency(item.cost)}</span>
                <span className='pct'>&nbsp;({item.pct.toFixed(1)}%)</span>
              </div>
              {subTree}
            </li>
          );
        })}
        </ul>
      </div>
    );
  }
  blockTree() {
    const active = this.props.blocks.get('active');
    const deep = this.props.blocks.get('deep');
    let blockClasses = ['block-tree', 'flex'];
    if (deep) {
      blockClasses = blockClasses.concat([
        'block-tree-deep',
        `block-tree-${deep}`
      ]);
    }
    blockClasses = blockClasses.join(' ');

    return (
      <BlockView dispatcher={this.props.dispatcher}
        onBlockClick={block => {
          this.dispatchAction(aBlockClicked(block.get('name')));
        }}
        onBlockHover={(block, subBlock) => { this.dispatchAction(aContentBlockHovered(block, subBlock)); }}
        blocks={this.props.blocks.get('blocks')}
        blockClasses={blockClasses}
        active={active}
        deep={!!deep}
        status={this.props.blocks.get('status')}
      />
    );
  }
  render() {
    const listTree = this.listTree();
    const blockTree = this.blockTree();

    return (
      <div className='page-analysis'>
        <div className='upper'>
          <span className='input-period'>
            <span>Period:</span>
            {ANALYSIS_PERIODS.map((period, key) => {
              return (
                <span key={key}>
                  <input type='radio' checked={this.props.other.get('period') === key}
                    onChange={() => this.dispatchAction(aPeriodChanged(key))} />
                  <span>{capitalise(period)}</span>
                </span>
              );
            })}
          </span>
          <span className='input-grouping'>
            <span>Grouping:</span>
            {ANALYSIS_GROUPINGS.map((grouping, key) => {
              return (
                <span key={key}>
                  <input type='radio' checked={this.props.other.get('grouping') === key}
                    onChange={() => this.dispatchAction(aGroupingChanged(key))} />
                  <span>{capitalise(grouping)}</span>
                </span>
              );
            })}
          </span>
          <div className='btns'>
            <button className='btn-previous'
              onClick={() => {
                this.dispatchAction(aTimeIndexChanged(this.props.other.get('timeIndex') + 1));
              }}>Previous</button>
            <button className='btn-next' disabled={this.props.other.get('timeIndex') === 0}
              onClick={() => {
                this.dispatchAction(aTimeIndexChanged(this.props.other.get('timeIndex') - 1));
              }}>Next</button>
          </div>
          <h3 className='period-title'>{this.props.description}</h3>
          <div className='flexbox'>
            {listTree}
            {blockTree}
          </div>
        </div>
      </div>
    );
  }
}

PageAnalysis.propTypes = {
  cost: PropTypes.instanceOf(list),
  costTotal: PropTypes.number,
  items: PropTypes.instanceOf(map),
  description: PropTypes.string,
  blocks: PropTypes.instanceOf(map),
  other: PropTypes.instanceOf(map)
};

