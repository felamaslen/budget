import React, { useContext, useMemo } from 'react';
import AutoSizer from 'react-virtualized-auto-sizer';
import { FixedSizeList } from 'react-window';

import { createListContext } from './context';
import * as Styled from './styles';
import { PropsMemoisedItem } from './types';
import { Item } from '~client/types';

type Props<I extends Item, E extends {}> = {
  isMobile: boolean;
  items: I[];
  MemoisedItem: React.FC<PropsMemoisedItem<E>>;
};

type PropsRow<I extends Item> = {
  data: I[];
  index: number;
  style: object;
};

const makeRow = <I extends Item, E extends {}>(
  MemoisedItem: React.FC<PropsMemoisedItem<E>>,
): React.FC<PropsRow<I>> => {
  const InfiniteItem: React.FC<PropsRow<I>> = ({ data, index, style }) => {
    const extraProps = useContext(createListContext<E>());

    return (
      <MemoisedItem
        key={data[index].id}
        id={data[index].id}
        style={style}
        odd={index % 2 === 1}
        extraProps={extraProps[data[index].id]}
      />
    );
  };
  return InfiniteItem;
};

export const InfiniteWindow = <I extends Item, E extends {}>({
  isMobile,
  items,
  MemoisedItem,
}: Props<I, E>): React.ReactElement<Props<I, E>> => {
  const Row = useMemo(() => makeRow(MemoisedItem), [MemoisedItem]);
  return (
    <Styled.InfiniteWindow role="list">
      <AutoSizer>
        {({ height, width }): React.ReactNode => (
          <FixedSizeList
            itemCount={items.length}
            itemData={items}
            itemSize={isMobile ? Styled.rowHeightMobile : Styled.rowHeightDesktop}
            height={height}
            width={width}
          >
            {Row}
          </FixedSizeList>
        )}
      </AutoSizer>
    </Styled.InfiniteWindow>
  );
};
