import React, { useMemo } from 'react';
import AutoSizer from 'react-virtualized-auto-sizer';
import { FixedSizeList } from 'react-window';

import * as Styled from './styles';
import { PropsMemoisedItem } from './types';
import { Item } from '~client/types';

type Props<I extends Item> = {
  isMobile: boolean;
  items: I[];
  MemoisedItem: React.FC<PropsMemoisedItem>;
};

type PropsRow<I extends Item> = {
  data: I[];
  index: number;
  style: object;
};

const makeRow = <I extends Item>(
  MemoisedItem: React.FC<PropsMemoisedItem>,
): React.FC<PropsRow<I>> => ({ data, index, style }): React.ReactElement<PropsRow<I>> => (
  <MemoisedItem id={data[index].id} style={style} />
);

export const InfiniteWindow = <I extends Item>({
  isMobile,
  items,
  MemoisedItem,
}: Props<I>): React.ReactElement<Props<I>> => {
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
