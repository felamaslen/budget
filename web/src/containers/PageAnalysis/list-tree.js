import React, { useCallback } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';

import { formatCurrency } from '~client/modules/format';
import { costShape } from '~client/prop-types/page/analysis';
import ListTreeHead from '~client/containers/PageAnalysis/list-tree-head';
import SubTree from '~client/containers/PageAnalysis/sub-tree';

function ListTreeItem({
    item: { name, itemCost, subTree, pct, visible, open },
    onHover,
    onToggle,
    onToggleExpand
}) {
    const onMouseOver = useCallback(() => onHover(name), [name, onHover]);
    const onMouseOut = useCallback(() => onHover(null), [onHover]);

    const onToggleCallback = useCallback(event => {
        event.stopPropagation();
        onToggle(name);
    }, [name, onToggle]);

    const onToggleExpandCallback = useCallback(() => onToggleExpand(name), [onToggleExpand, name]);

    return (
        <li key={name} className={classNames('tree-list-item', name, { open })}>
            <div className="main"
                onClick={onToggleExpandCallback}
                onMouseOver={onMouseOver}
                onMouseOut={onMouseOut}
            >
                <span className="indicator" />
                <input type="checkbox"
                    defaultChecked={visible}
                    onClick={onToggleCallback}
                />
                <span className="title">{name}</span>
                <span className="cost">{formatCurrency(itemCost)}</span>
                <span className="pct">{' ('}{pct.toFixed(1)}{'%)'}</span>
            </div>
            <SubTree
                name={name}
                itemCost={itemCost}
                subTree={subTree}
                open={open}
                onHover={onHover}
            />
        </li>
    );
}

ListTreeItem.propTypes = {
    item: PropTypes.shape({
    }).isRequired,
    onHover: PropTypes.func.isRequired,
    onToggle: PropTypes.func.isRequired,
    onToggleExpand: PropTypes.func.isRequired
};

const useToggle = onToggle => useCallback(name => onToggle(last => ({
    ...last,
    [name]: last[name] === false
})), [onToggle]);

export default function ListTree({ cost, treeVisible, treeOpen, onHover, toggleTreeItem, setTreeOpen }) {
    const costTotal = cost.reduce((sum, { total }) => sum + total, 0);

    const costPct = cost.map(({ name, total, subTree }) => ({
        name,
        itemCost: total,
        subTree,
        pct: 100 * total / costTotal,
        visible: !(treeVisible[name] === false),
        open: Boolean(treeOpen[name])
    }));

    const onToggle = useToggle(toggleTreeItem);
    const onToggleExpand = useToggle(setTreeOpen);

    return (
        <div className="tree">
            <ul className="tree-list">
                <ListTreeHead items={costPct} />
                {costPct.map(item => (
                    <ListTreeItem key={item.name}
                        item={item}
                        onHover={onHover}
                        onToggle={onToggle}
                        onToggleExpand={onToggleExpand}
                    />
                ))}
            </ul>
        </div>
    );
}

ListTree.propTypes = {
    cost: costShape,
    treeVisible: PropTypes.objectOf(PropTypes.bool).isRequired,
    treeOpen: PropTypes.objectOf(PropTypes.bool).isRequired,
    toggleTreeItem: PropTypes.func.isRequired,
    setTreeOpen: PropTypes.func.isRequired,
    onHover: PropTypes.func.isRequired
};
