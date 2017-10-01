/**
 * Block packer component
 */

import { List as list } from 'immutable';
import { connect } from 'react-redux';

import { PAGES } from '../misc/const';

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';

const pageIndex = PAGES.indexOf('analysis');

export class BlockView extends Component {
    renderBlocks(activeMain, activeSub) {
        if (!this.props.blocks) {
            return null;
        }

        return this.props.blocks.map((group, groupKey) => {
            const groupStyle = {
                width: group.get('width'),
                height: group.get('height')
            };

            const groupBits = group.get('bits').map((block, blockKey) => {
                const classes = classNames({
                    block: true,
                    active: activeMain && this.props.active[0] === block.get('name'),
                    [`block-${block.get('color')}`]: true,
                    [`block-${block.get('name')}`]: !this.props.deepBlock
                });

                const bits = block.get('blocks').map((subBlockGroup, subBlockGroupKey) => {
                    const blockBits = subBlockGroup.get('bits').map((subBlock, subBlockKey) => {
                        const active = activeSub &&
                            this.props.active[0] === block.get('name') &&
                            this.props.active[1] === subBlock.get('name');

                        const subClasses = classNames({ 'sub-block': true, active });

                        const subBlockStyle = {
                            width: subBlock.get('width'),
                            height: subBlock.get('height')
                        };

                        const onMouseOver = () => {
                            this.props.onBlockHover(block, subBlock);
                        };

                        return <div key={subBlockKey} className={subClasses} style={subBlockStyle}
                            onMouseOver={onMouseOver}></div>;
                    });

                    const subBlockGroupStyle = {
                        width: subBlockGroup.get('width'),
                        height: subBlockGroup.get('height')
                    };

                    return <div key={subBlockGroupKey} className="block-group" style={subBlockGroupStyle}>
                        {blockBits}
                    </div>;
                });

                const blockStyle = {
                    width: block.get('width'),
                    height: block.get('height')
                };

                const onClick = () => this.props.onBlockClick({
                    pageIndex, name: block.get('name')
                });

                return <div key={blockKey} className={classes} style={blockStyle}
                    onClick={onClick}>{bits}</div>;
            });

            return <div key={groupKey} className="block-group" style={groupStyle}>
                {groupBits}
            </div>;
        });
    }
    render() {
        const blockClasses = classNames({
            'block-tree': true,
            flex: true,
            'block-tree-deep': this.props.deepBlock,
            [`block-tree-${this.props.deepBlock}`]: this.props.deepBlock
        });

        const onMouseOut = () => this.props.onBlockHover(null, null);
        const activeMain = this.props.active && this.props.active.length === 1;
        const activeSub = this.props.active && this.props.active.length === 2;

        const blocks = this.renderBlocks(activeMain, activeSub);

        return <div className="block-view" onMouseOut={onMouseOut}>
            <div className="block-tree-outer">
                <div className={blockClasses}>{blocks}</div>
            </div>
            <div className="status-bar">
                <span className="inner">{this.props.status}</span>
            </div>
        </div>;
    }
}

BlockView.propTypes = {
    blocks: PropTypes.instanceOf(list),
    active: PropTypes.array,
    deepBlock: PropTypes.string,
    status: PropTypes.string,
    onBlockClick: PropTypes.func.isRequired,
    onBlockHover: PropTypes.func.isRequired
};

const mapStateToProps = state => ({
    active: state.getIn(['global', 'other', 'blockView', 'active']),
    blocks: state.getIn(['global', 'other', 'blockView', 'blocks']),
    deepBlock: state.getIn(['global', 'other', 'blockView', 'deep']),
    status: state.getIn(['global', 'other', 'blockView', 'status'])
});

export default connect(mapStateToProps, null)(BlockView);

