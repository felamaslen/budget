import { List as list, Map as map } from 'immutable';
import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import BlockBits from './block-bits';

export function OuterBlockGroup({ group, activeMain, activeSub, activeBlock, ...props }) {
    const style = {
        width: group.get('width'),
        height: group.get('height')
    };

    const groupBits = group.get('bits').map((block, key) => <BlockBits
        key={key}
        block={block}
        activeMain={activeMain}
        activeSub={activeSub}
        activeBlock={activeBlock}
        {...props}
    />);

    return <div className="block-group" style={style}>
        {groupBits}
    </div>;
}

OuterBlockGroup.propTypes = {
    group: PropTypes.instanceOf(map).isRequired,
    activeMain: PropTypes.bool.isRequired,
    activeSub: PropTypes.bool.isRequired,
    activeBlock: PropTypes.array
};

export default function Blocks({ blocks, activeBlock, deep, ...props }) {
    const activeMain = Boolean(activeBlock && activeBlock.length === 1);
    const activeSub = Boolean(activeBlock && activeBlock.length === 2);
    const activeDeep = Boolean(deep);

    const className = classNames('block-tree', {
        'block-tree-deep': activeDeep,
        [`block-tree-${deep}`]: activeDeep
    });

    const blocksList = blocks.map((group, key) => <OuterBlockGroup
        key={key}
        group={group}
        activeMain={activeMain}
        activeSub={activeSub}
        activeBlock={activeBlock}
        deep={deep}
        {...props}
    />);

    return <div className={className}>{blocksList}</div>;
}

Blocks.propTypes = {
    blocks: PropTypes.instanceOf(list).isRequired,
    activeBlock: PropTypes.array,
    deep: PropTypes.string
};

