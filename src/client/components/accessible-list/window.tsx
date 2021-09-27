import moize from 'moize';
import React, { CSSProperties, useContext, useMemo } from 'react';
import { useSelector } from 'react-redux';
import AutoSizer from 'react-virtualized-auto-sizer';
import { FixedSizeList } from 'react-window';
import InfiniteLoader from 'react-window-infinite-loader';

import { createListContext } from './context';
import { useMoreItems } from './hooks';
import * as Styled from './styles';
import type { PropsMemoisedItem, UseItems } from './types';
import { getOlderExists } from '~client/selectors';
import type { Item, PageList } from '~client/types';
import type { PageListStandard } from '~client/types/gql';

type Props<I extends Item, P extends PageList, E extends Record<string, unknown>> = {
  page: P;
  isMobile: boolean;
  items: I[];
  MemoisedItem: React.FC<PropsMemoisedItem<E>>;
  useItems?: UseItems<P>;
};

type ItemData<I extends Item> = {
  items: I[];
  olderExists: boolean;
};

type PropsRow<I extends Item> = {
  data: ItemData<I>;
  index: number;
  style: CSSProperties;
};

const isItemLoaded = moize(
  <I extends Item>(data: ItemData<I>) => (index: number): boolean =>
    !data.olderExists || index < data.items.length,
  { maxSize: 1 },
);

const makeRow = <I extends Item, E extends Record<string, unknown>>(
  MemoisedItem: React.FC<PropsMemoisedItem<E>>,
): React.FC<PropsRow<I>> => {
  const InfiniteItem: React.FC<PropsRow<I>> = ({ data, index, style }) => {
    const extraProps = useContext(createListContext<E>());

    if (!isItemLoaded(data)(index)) {
      return <div>Loading...</div>;
    }

    return (
      <MemoisedItem
        key={data.items[index].id}
        id={data.items[index].id}
        style={style}
        odd={index % 2 === 1}
        extraProps={extraProps[data.items[index].id]}
      />
    );
  };
  return InfiniteItem;
};

export const InfiniteWindow = <
  I extends Item,
  P extends PageListStandard,
  E extends Record<string, unknown>
>({
  page,
  isMobile,
  items,
  useItems = useMoreItems,
  MemoisedItem,
}: Props<I, P, E>): React.ReactElement => {
  const olderExists = useSelector(getOlderExists(page));
  const itemCount = olderExists ? items.length + 1 : items.length;

  const loadMore = useItems(page);

  const itemData = useMemo<ItemData<I>>(() => ({ items, olderExists }), [items, olderExists]);

  const Row = useMemo(() => makeRow(MemoisedItem), [MemoisedItem]);

  return (
    <Styled.InfiniteWindow role="list">
      <AutoSizer>
        {({ height, width }): React.ReactNode => (
          <InfiniteLoader
            isItemLoaded={isItemLoaded(itemData)}
            itemCount={itemCount}
            loadMoreItems={loadMore}
          >
            {({ ref, onItemsRendered }): React.ReactNode => (
              <FixedSizeList
                ref={ref}
                onItemsRendered={onItemsRendered}
                itemCount={items.length}
                itemData={itemData}
                itemSize={isMobile ? Styled.rowHeightMobile : Styled.rowHeightDesktop}
                height={height}
                width={width}
              >
                {Row}
              </FixedSizeList>
            )}
          </InfiniteLoader>
        )}
      </AutoSizer>
    </Styled.InfiniteWindow>
  );
};
