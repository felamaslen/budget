import React, { useCallback } from 'react';

import * as Styled from './styles';
import { SubTree, Props as SubTreeProps } from './sub-tree';
import { formatCurrency, formatPercent } from '~client/modules/format';
import { FlexCenter } from '~client/styled/shared';
import type { AnalysisSortedTree, AnalysisTreeVisible, MainBlockName } from '~client/types';
import { AnalysisPage } from '~client/types/gql';

type PropsItem = {
  item: AnalysisSortedTree<MainBlockName>;
  disabled?: boolean;
  visible: boolean;
  ratio: number;
  bold?: boolean;
  onHover: SubTreeProps['onHover'];
  onToggle: (name: MainBlockName) => void;
  onToggleExpand: (name: MainBlockName) => void;
} & Pick<Styled.TreeProps, 'open' | 'bold' | 'indent'>;

const ListTreeItem: React.FC<PropsItem> = ({
  item,
  disabled = false,
  open = false,
  visible,
  ratio,
  bold,
  indent,
  onHover,
  onToggle,
  onToggleExpand,
}) => {
  const { name, subTree, total } = item;
  const onMouseOver = useCallback(() => onHover(name), [name, onHover]);
  const onMouseOut = useCallback(() => onHover(), [onHover]);
  const onToggleCallback = useCallback(
    (event) => {
      event.stopPropagation();
      onToggle(name);
    },
    [name, onToggle],
  );

  const onToggleExpandCallback = useCallback(() => onToggleExpand(name), [onToggleExpand, name]);

  return (
    <Styled.TreeListItem key={name} bold={bold} indent={indent}>
      <Styled.TreeMain
        open={open}
        hasSubTree={(subTree?.length ?? 0) > 0}
        onClick={onToggleExpandCallback}
        onMouseOver={onMouseOver}
        onFocus={onMouseOver}
        onMouseOut={onMouseOut}
        onBlur={onMouseOut}
      >
        <Styled.TreeIndicator name={name} />
        <Styled.TreeToggle>
          <input
            type="checkbox"
            defaultChecked={visible}
            onClick={onToggleCallback}
            disabled={disabled}
          />
        </Styled.TreeToggle>
        <Styled.TreeTitle>{name}</Styled.TreeTitle>
        <Styled.TreeValue>{formatCurrency(total)}</Styled.TreeValue>
        <Styled.TreeValue>({formatPercent(ratio, { precision: 1 })})</Styled.TreeValue>
      </Styled.TreeMain>
      <SubTree name={name} itemCost={total} subTree={subTree} open={open} onHover={onHover} />
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
  income: number;
  cost: AnalysisSortedTree<MainBlockName>[];
  treeVisible: AnalysisTreeVisible;
  treeOpen: AnalysisTreeVisible;
  onHover: PropsItem['onHover'];
  toggleTreeItem: PropsItem['onToggle'];
  setTreeOpen: Toggler;
};

const ListTree: React.FC<Props> = ({
  cost,
  income,
  treeVisible,
  treeOpen,
  onHover,
  toggleTreeItem,
  setTreeOpen,
}) => {
  const onToggleExpand = useToggle(setTreeOpen);
  const itemIncome = cost.find(({ name }) => name === AnalysisPage.Income);
  const itemSaved = cost.find(({ name }) => name === 'saved');
  const itemInvested = cost.find(({ name }) => name === 'invested');

  const totalExpenses = cost
    .filter(({ name, derived }) => !derived && name !== AnalysisPage.Income)
    .reduce<number>((last, { total }) => last + total, 0);

  return (
    <Styled.Tree>
      <Styled.TreeList>
        {itemIncome && (
          <ListTreeItem
            bold
            key={AnalysisPage.Income}
            item={itemIncome}
            open={!!treeOpen[AnalysisPage.Income]}
            visible={treeVisible[AnalysisPage.Income] !== false}
            ratio={1}
            onHover={onHover}
            onToggle={toggleTreeItem}
            onToggleExpand={onToggleExpand}
          />
        )}
        {itemSaved && (
          <ListTreeItem
            key="saved"
            item={itemSaved}
            open={!!treeOpen.saved}
            visible={treeVisible.saved !== false}
            ratio={income ? itemSaved.total / income : 0}
            disabled={!!treeVisible[AnalysisPage.Income]}
            onHover={onHover}
            onToggle={toggleTreeItem}
            onToggleExpand={onToggleExpand}
          />
        )}
        {itemInvested && (
          <Styled.TreeListItem indent={1}>
            <FlexCenter>
              <Styled.TreeTitleFilled>Invested</Styled.TreeTitleFilled>
              <Styled.TreeValue>{formatCurrency(itemInvested.total)}</Styled.TreeValue>
              <Styled.TreeValue>
                ({formatPercent(income ? itemInvested.total / income : 0, { precision: 1 })})
              </Styled.TreeValue>
            </FlexCenter>
          </Styled.TreeListItem>
        )}
        <Styled.TreeListItem bold>
          <FlexCenter>
            <Styled.TreeTitleFilled>Expenses</Styled.TreeTitleFilled>
            <Styled.TreeValue>{formatCurrency(totalExpenses)}</Styled.TreeValue>
            <Styled.TreeValue>
              ({formatPercent(income ? totalExpenses / income : 0, { precision: 1 })})
            </Styled.TreeValue>
          </FlexCenter>
        </Styled.TreeListItem>
        {cost
          .filter(({ name }) => ![AnalysisPage.Income, 'saved', 'invested'].includes(name))
          .map((item) => (
            <ListTreeItem
              key={item.name}
              item={item}
              open={!!treeOpen[item.name]}
              indent={1}
              visible={treeVisible[item.name] !== false}
              ratio={totalExpenses ? item.total / totalExpenses : 0}
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
