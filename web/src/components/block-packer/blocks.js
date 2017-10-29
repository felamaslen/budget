import { List as list } from 'immutable';
import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';

import BlockBits from './block-bits';

export default function Blocks({ blocks, activeBlock, ...props }) {
    const activeMain = Boolean(activeBlock && activeBlock.length === 1);
    const activeSub = Boolean(activeBlock && activeBlock.length === 2);

    const blockClasses = classNames({
        'block-tree': true,
        'block-tree-deep': props.deepBlock,
        [`block-tree-${props.deepBlock}`]: props.deepBlock
    });

    const blocksList = blocks.map((group, groupKey) => {
        const groupStyle = {
            width: group.get('width'),
            height: group.get('height')
        };

        const groupBits = group.get('bits').map(block => <BlockBits
            key={block.get('name')}
            activeMain={activeMain}
            activeSub={activeSub}
            block={block}
            activeBlock={activeBlock}
            {...props}
        />);

        return <div key={groupKey} className="block-group" style={groupStyle}>
            {groupBits}
        </div>;
    });

    return <div className={blockClasses}>{blocksList}</div>;
}

Blocks.propTypes = {
    blocks: PropTypes.instanceOf(list).isRequired,
    activeBlock: PropTypes.array,
    deepBlock: PropTypes.string
};

