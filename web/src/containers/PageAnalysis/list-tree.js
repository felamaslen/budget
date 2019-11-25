import React, { useCallback } from 'react';
import PropTypes from 'prop-types';

import { formatCurrency } from '~client/modules/format';
import { costShape } from '~client/prop-types/page/analysis';
import ListTreeHead from '~client/containers/PageAnalysis/list-tree-head';
import SubTree from '~client/containers/PageAnalysis/sub-tree';

import * as Styled from './styles';

function ListTreeItem({
    item: {
        name, itemCost, subTree, pct, visible, open,
    },
    onHover,
    onToggle,
    onToggleExpand,
}) {
    const onMouseOver = useCallback(() => onHover(name), [name, onHover]);
    const onMouseOut = useCallback(() => onHover(null), [onHover]);

    const onToggleCallback = useCallback((event) => {
        event.stopPropagation();
        onToggle(name);
    }, [name, onToggle]);

    const onToggleExpandCallback = useCallback(() => onToggleExpand(name), [onToggleExpand, name]);

    return (
        <Styled.TreeListItem
            key={name}
        >
            <Styled.TreeMain
                open={open}
                onClick={onToggleExpandCallback}
                onMouseOver={onMouseOver}
                onMouseOut={onMouseOut}
            >
                <Styled.TreeIndicator name={name} />
                <input type="checkbox"
                    defaultChecked={visible}
                    onClick={onToggleCallback}
                />
                <Styled.TreeTitle>{name}</Styled.TreeTitle>
                <Styled.TreeValue>{formatCurrency(itemCost)}</Styled.TreeValue>
                <Styled.TreeValue>{' ('}{pct.toFixed(1)}{'%)'}</Styled.TreeValue>
            </Styled.TreeMain>
            <SubTree
                name={name}
                itemCost={itemCost}
                subTree={subTree}
                open={open}
                onHover={onHover}
            />
        </Styled.TreeListItem>
    );
}

ListTreeItem.propTypes = {
    item: PropTypes.shape({
    }).isRequired,
    onHover: PropTypes.func.isRequired,
    onToggle: PropTypes.func.isRequired,
    onToggleExpand: PropTypes.func.isRequired,
};

const useToggle = (onToggle) => useCallback((name) => onToggle((last) => ({
    ...last,
    [name]: !last[name],
})), [onToggle]);

function ListTree({
    cost, treeVisible, treeOpen, onHover, toggleTreeItem, setTreeOpen,
}) {
    const costTotal = cost.reduce((sum, { total }) => sum + total, 0);

    const costPct = cost.map(({ name, total, subTree }) => ({
        name,
        itemCost: total,
        subTree,
        pct: 100 * (total / costTotal),
        visible: !(treeVisible[name] === false),
        open: Boolean(treeOpen[name]),
    }));

    const onToggleExpand = useToggle(setTreeOpen);

    return (
        <Styled.Tree>
            <Styled.TreeList>
                <ListTreeHead items={costPct} />
                {costPct.map((item) => (
                    <ListTreeItem key={item.name}
                        item={item}
                        onHover={onHover}
                        onToggle={toggleTreeItem}
                        onToggleExpand={onToggleExpand}
                    />
                ))}
            </Styled.TreeList>
        </Styled.Tree>
    );
}

ListTree.propTypes = {
    cost: costShape,
    treeVisible: PropTypes.objectOf(PropTypes.bool).isRequired,
    treeOpen: PropTypes.objectOf(PropTypes.bool).isRequired,
    toggleTreeItem: PropTypes.func.isRequired,
    setTreeOpen: PropTypes.func.isRequired,
    onHover: PropTypes.func.isRequired,
};

export default React.memo(ListTree);
