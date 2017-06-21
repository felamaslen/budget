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
  aBlockClicked, aBlockHovered
} from '../../actions/AnalysisActions';

export class PageAnalysis extends PureControllerView {
  format(value, abbreviate) {
    return formatCurrency(value, { abbreviate, precision: 1 });
  }
  listTree() {
    return (
      <div className='tree'>
        <ul className='tree-list flex'>
        {this.props.cost.map((item, key) => {
          const itemTotal = item.get('total');
          const itemPct = (100 * itemTotal / this.props.costTotal).toFixed(1);
          const itemName = item.get('name');
          const visible = this.props.other.get('treeVisible').has(itemName) ?
            this.props.other.get('treeVisible').get(itemName) : true;

          let subTree = null;
          const open = !!this.props.other.get('treeOpen').get(itemName);
          if (open) {
            subTree = (
              <ul className='sub-tree'>
              {item.get('subTree').map((subItem, subKey) => {
                const subItemTotal = subItem.get('total');
                const subItemPct = (100 * subItemTotal / itemTotal).toFixed(1);
                const subItemName = subItem.get('name');

                return (
                  <li key={subKey} className='tree-list-item'
                    onMouseOver={() => this.dispatchAction(aTreeItemHovered([itemName, subItemName]))}
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
                onClick={() => this.dispatchAction(aTreeItemExpandToggled(itemName))}
                onMouseOver={() => this.dispatchAction(aTreeItemHovered([itemName]))}
                onMouseOut={() => this.dispatchAction(aTreeItemHovered(null))}>
                <input type='checkbox' checked={visible}
                  onChange={() => this.dispatchAction(aTreeItemDisplayToggled(itemName))} />
                <span className='title'>{itemName}</span>
                <span className='cost'>{formatCurrency(itemTotal)}</span>
                <span className='pct'>&nbsp;({itemPct}%)</span>
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
    let blockClasses = ['block-tree', 'flex'];
    if (this.props.other.get('deepBlock')) {
      blockClasses = blockClasses.concat([
        'block-tree-deep',
        `block-tree-${this.props.other.get('deepBlock')}`
      ]);
    }
    blockClasses = blockClasses.join(' ');

    return (
      <div className='block-view' onMouseOut={() => this.dispatchAction(aBlockHovered(null))}>
        <div className={blockClasses}>
        {this.props.blocks.map((group, groupKey) => {
          return (
            <div key={groupKey} className='block-group' style={{
              width: group.get('width'), height: group.get('height')
            }}>
            {group.get('bits').map((block, blockKey) => {
              const classes = classNames({
                block: true,
                [`block-${block.get('color')}`]: true,
                [`block-${block.get('name')}`]: !this.props.other.get('deepBlock')
              });
              return (
                <div key={blockKey} className={classes} style={{
                  width: block.get('width'), height: block.get('height')
                }} onClick={() => {
                  this.dispatchAction(aBlockClicked([groupKey, blockKey]));
                }}>
                {block.get('blocks').map((subBlockGroup, subBlockGroupKey) => {
                  return (
                    <div key={subBlockGroupKey} className='block-group' style={{
                      width: subBlockGroup.get('width'), height: subBlockGroup.get('height')
                    }}>
                    {subBlockGroup.get('bits').map((subBlock, subBlockKey) => {
                      return (
                        <div key={subBlockKey} className='sub-block' style={{
                          width: subBlock.get('width'), height: subBlock.get('height')
                        }} onMouseOver={() => {
                          this.dispatchAction(aBlockHovered(
                            [groupKey, blockKey, subBlockGroupKey, subBlockKey]
                          ))
                        }}></div>
                      );
                    })}
                    </div>
                  );
                })}
                </div>
              );
            })}
            </div>
          );
        })}
        </div>
        <div className='status-bar'>{this.props.other.get('status')}</div>
      </div>
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
  blocks: PropTypes.instanceOf(list),
  other: PropTypes.instanceOf(map)
};

