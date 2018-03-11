import { Map as map } from 'immutable';
import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';

export function SubBlock({ name, value, subBlock, activeSub, activeBlock, onHover }) {
    const active = activeSub &&
        activeBlock[0] === name &&
        activeBlock[1] === subBlock.get('name');

    const className = classNames('sub-block', { active });

    const style = {
        width: subBlock.get('width'),
        height: subBlock.get('height')
    };

    const onBlockHover = () => onHover(map({ name, value }), subBlock);

    return <div
        className={className}
        style={style}
        onTouchStart={onBlockHover}
        onMouseOver={onBlockHover}
    />;
}

SubBlock.propTypes = {
    name: PropTypes.string.isRequired,
    value: PropTypes.number.isRequired,
    subBlock: PropTypes.instanceOf(map).isRequired,
    activeSub: PropTypes.bool.isRequired,
    activeBlock: PropTypes.array,
    onHover: PropTypes.func.isRequired
};

export function BlockGroup({ group, ...props }) {
    const blockBits = group.get('bits').map((subBlock, key) => <SubBlock
        key={key}
        subBlock={subBlock}
        {...props}
    />);

    const style = {
        width: group.get('width'),
        height: group.get('height')
    };

    return <div className="block-group" style={style}>
        {blockBits}
    </div>;
}

BlockGroup.propTypes = {
    group: PropTypes.instanceOf(map).isRequired
};

export default function BlockBits({ page, block, activeMain, activeBlock, deep, onClick, ...props }) {
    const name = block.get('name');
    const value = block.get('value');

    const className = classNames('block', `block-${block.get('color')}`, {
        active: activeMain && activeBlock[0] === name,
        [`block-${name}`]: !deep
    });

    const bits = block.get('blocks').map((group, key) => <BlockGroup
        key={key}
        activeBlock={activeBlock}
        name={name}
        value={value}
        group={group}
        {...props}
    />);

    const style = {
        width: block.get('width'),
        height: block.get('height')
    };

    const wasDeep = Boolean(deep);

    const onBlockClick = () => onClick({ wasDeep, page, name: block.get('name') });

    return <div className={className} style={style}
        onClick={onBlockClick}>
        {bits}
    </div>;
}

BlockBits.propTypes = {
    block: PropTypes.instanceOf(map).isRequired,
    page: PropTypes.string.isRequired,
    activeMain: PropTypes.bool.isRequired,
    activeSub: PropTypes.bool.isRequired,
    activeBlock: PropTypes.array,
    deep: PropTypes.string,
    onHover: PropTypes.func.isRequired,
    onClick: PropTypes.func.isRequired
};

