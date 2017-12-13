import { Map as map } from 'immutable';
import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';

export default function BlockBits({
    pageIndex,
    block,
    activeMain,
    activeSub,
    activeBlock,
    deepBlock,
    onHover,
    onClick
}) {
    const classes = classNames({
        block: true,
        active: activeMain && activeBlock[0] === block.get('name'),
        [`block-${block.get('color')}`]: true,
        [`block-${block.get('name')}`]: !deepBlock
    });

    const bits = block.get('blocks').map((subBlockGroup, subBlockGroupKey) => {
        const blockBits = subBlockGroup.get('bits').map((subBlock, subBlockKey) => {
            const active = activeSub &&
                activeBlock[0] === block.get('name') &&
                activeBlock[1] === subBlock.get('name');

            const subClasses = classNames({ 'sub-block': true, active });

            const subBlockStyle = {
                width: subBlock.get('width'),
                height: subBlock.get('height')
            };

            const onBlockHover = () => onHover(block, subBlock);

            return <div key={subBlockKey} className={subClasses}
                style={subBlockStyle}
                onTouchStart={onBlockHover} onMouseOver={onBlockHover} />;
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

    const wasDeep = Boolean(deepBlock);

    const onBlockClick = () => onClick({ pageIndex, name: block.get('name'), wasDeep });

    return <div className={classes} style={blockStyle}
        onClick={onBlockClick}>
        {bits}
    </div>;
}

BlockBits.propTypes = {
    block: PropTypes.instanceOf(map).isRequired,
    pageIndex: PropTypes.number.isRequired,
    activeMain: PropTypes.bool.isRequired,
    activeSub: PropTypes.bool.isRequired,
    activeBlock: PropTypes.array,
    deepBlock: PropTypes.string,
    onHover: PropTypes.func.isRequired,
    onClick: PropTypes.func.isRequired
};

