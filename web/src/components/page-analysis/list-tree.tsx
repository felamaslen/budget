import React, { useCallback } from 'react';

import ListTreeHead from './list-tree-head';
import * as Styled from './styles';
import { SubTree, Props as SubTreeProps } from './sub-tree';
import { formatCurrency } from '~client/modules/format';
import type { AnalysisSortedTree, AnalysisTreeVisible, MainBlockName } from '~client/types';

type PropsItem = {
  item: Pick<SubTreeProps, 'name' | 'itemCost' | 'subTree'> & {
    pct: number;
    visible: boolean;
    open: boolean;
  };
  onHover: SubTreeProps['onHover'];
  onToggle: (name: MainBlockName) => void;
  onToggleExpand: (name: MainBlockName) => void;
};

const ListTreeItem: React.FC<PropsItem> = ({
  item: { name, itemCost, subTree, pct, visible, open },
  onHover,
  onToggle,
  onToggleExpand,
}) => {
  const onMouseOver = useCallback(() => onHover(name), [name, onHover]);
  const onMouseOut = useCallback(() => onHover(null), [onHover]);

  const onToggleCallback = useCallback(
    (event) => {
      event.stopPropagation();
      onToggle(name);
    },
    [name, onToggle],
  );

  const onToggleExpandCallback = useCallback(() => onToggleExpand(name), [onToggleExpand, name]);

  return (
    <Styled.TreeListItem key={name}>
      <Styled.TreeMain
        open={open}
        onClick={onToggleExpandCallback}
        onMouseOver={onMouseOver}
        onFocus={onMouseOver}
        onMouseOut={onMouseOut}
        onBlur={onMouseOut}
      >
        <Styled.TreeIndicator name={name} />
        <input type="checkbox" defaultChecked={visible} onClick={onToggleCallback} />
        <Styled.TreeTitle>{name}</Styled.TreeTitle>
        <Styled.TreeValue>{formatCurrency(itemCost)}</Styled.TreeValue>
        <Styled.TreeValue>
          {' ('}
          {pct.toFixed(1)}
          {'%)'}
        </Styled.TreeValue>
      </Styled.TreeMain>
      <SubTree name={name} itemCost={itemCost} subTree={subTree} open={open} onHover={onHover} />
    </Styled.TreeListItem>
  );
};

type Toggler = React.Dispatch<React.SetStateAction<AnalysisTreeVisible>>;

const useToggle = (onToggle: Toggler): ((name: MainBlockName) => void) =>
  useCallback(
    (name) =>
      onToggle(
        (last: AnalysisTreeVisible): AnalysisTreeVisible => ({
          ...last,
          [name]: !last[name],
        }),
      ),
    [onToggle],
  );

export type Props = {
  cost: AnalysisSortedTree<MainBlockName>[];
  treeVisible: AnalysisTreeVisible;
  treeOpen: AnalysisTreeVisible;
  onHover: PropsItem['onHover'];
  toggleTreeItem: PropsItem['onToggle'];
  setTreeOpen: Toggler;
};

const ListTree: React.FC<Props> = ({
  cost,
  treeVisible,
  treeOpen,
  onHover,
  toggleTreeItem,
  setTreeOpen,
}) => {
  const costTotal = cost.reduce((sum, { total }) => sum + total, 0);

  const costPct = cost.map(({ name, total, subTree }) => ({
    name,
    itemCost: total,
    subTree,
    pct: 100 * (costTotal === 0 ? 0 : total / costTotal),
    visible: !(treeVisible[name] === false),
    open: Boolean(treeOpen[name]),
  }));

  const onToggleExpand = useToggle(setTreeOpen);

  return (
    <Styled.Tree>
      <Styled.TreeList>
        <ListTreeHead items={costPct} />
        {costPct.map((item) => (
          <ListTreeItem
            key={item.name}
            item={item}
            onHover={onHover}
            onToggle={toggleTreeItem}
            onToggleExpand={onToggleExpand}
          />
        ))}
      </Styled.TreeList>
    </Styled.Tree>
  );
};

export default React.memo(ListTree);
