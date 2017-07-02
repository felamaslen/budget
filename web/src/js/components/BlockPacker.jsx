/**
 * Block packer component
 */

import { List as list } from 'immutable';
import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import PureControllerView from './PureControllerView';

export class BlockView extends PureControllerView {
  render() {
    const activeMain = this.props.active && this.props.active.length === 1;
    const activeSub = this.props.active && this.props.active.length === 2;

    const blocks = this.props.blocks ? this.props.blocks.map((group, groupKey) => {
      return (
        <div key={groupKey} className='block-group' style={{
          width: group.get('width'), height: group.get('height')
        }}>
        {group.get('bits').map((block, blockKey) => {
          const classes = classNames({
            block: true,
            active: activeMain && this.props.active[0] === block.get('name'),
            [`block-${block.get('color')}`]: true,
            [`block-${block.get('name')}`]: !this.props.deep
          });

          const bits = block.get('blocks').map((subBlockGroup, subBlockGroupKey) => {
            const blockBits = subBlockGroup.get('bits').map((subBlock, subBlockKey) => {
              const active = activeSub &&
                this.props.active[0] === block.get('name') &&
                this.props.active[1] === subBlock.get('name');

              const subClasses = classNames({ 'sub-block': true, active });

              return (
                <div key={subBlockKey} className={subClasses} style={{
                  width: subBlock.get('width'), height: subBlock.get('height')
                }} onMouseOver={() => {
                  this.props.onBlockHover(block, subBlock);
                }}></div>
              );
            });

            return (
              <div key={subBlockGroupKey} className='block-group' style={{
                width: subBlockGroup.get('width'), height: subBlockGroup.get('height')
              }}>{blockBits}</div>
            );
          });

          return (
            <div key={blockKey} className={classes} style={{
              width: block.get('width'), height: block.get('height')
            }} onClick={() => this.props.onBlockClick(block)}>{bits}</div>
          );
        })}
        </div>
      );
    }) : null;

    return (
      <div className='block-view' onMouseOut={() => this.props.onBlockHover(null, null) }>
        <div className='block-tree-outer'>
          <div className={this.props.blockClasses}>{blocks}</div>
        </div>
        <div className='status-bar'>
          <span className='inner'>{this.props.status}</span>
        </div>
      </div>
    );
  }
}

export class BlockViewShallow extends PureControllerView {
  render() {
    const blocks = this.props.blocks ? this.props.blocks.map((group, groupKey) => {
      return (
        <div key={groupKey} className='block-group' style={{
          width: group.get('width'), height: group.get('height')
        }}>
        {group.get('bits').map((block, blockKey) => {
          const classes = classNames({
            block: true,
            [`block-${block.get('color')}`]: true,
            [`block-${block.get('name')}`]: !this.props.deep
          });

          return (
            <div key={blockKey} className={classes} style={{
              width: block.get('width'), height: block.get('height')
            }} onMouseOver={() => {
              this.props.onBlockHover(block);
            }}></div>
          );
        })}
        </div>
      );
    }) : null;

    return (
      <div className='block-view graph-container' onMouseOut={() => {
        this.props.onBlockHover(null, null);
      }}>
        <div className='block-tree-outer'>
          <div className={this.props.blockClasses}>{blocks}</div>
        </div>
        <div className='status-bar'>
          <span className='inner'>{this.props.status}</span>
        </div>
      </div>
    );
  }
}

const BlockViewPropTypes = {
  blocks: PropTypes.instanceOf(list),
  blockClasses: PropTypes.string,
  onBlockClick: PropTypes.func,
  onBlockHover: PropTypes.func,
  active: PropTypes.array,
  deep: PropTypes.bool,
  status: PropTypes.string
};

BlockView.propTypes = BlockViewPropTypes;
BlockViewShallow.propTypes = BlockViewPropTypes;

