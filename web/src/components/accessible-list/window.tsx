import moize from 'moize';
import React, { useContext, useMemo, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import AutoSizer from 'react-virtualized-auto-sizer';
import { FixedSizeList } from 'react-window';
import InfiniteLoader from 'react-window-infinite-loader';

import { createListContext } from './context';
import * as Styled from './styles';
import { PropsMemoisedItem } from './types';
import { moreListDataRequestInitiated } from '~client/actions';
import { getOlderExists } from '~client/selectors';
import { Item } from '~client/types';

type Props<I extends Item, P extends string, E extends {}> = {
  page: P;
  isMobile: boolean;
  items: I[];
  MemoisedItem: React.FC<PropsMemoisedItem<E>>;
};

type ItemData<I extends Item> = {
  items: I[];
  olderExists: boolean;
};

type PropsRow<I extends Item> = {
  data: ItemData<I>;
  index: number;
  style: object;
};

const isItemLoaded = moize(
  <I extends Item>(data: ItemData<I>) => (index: number): boolean =>
    !data.olderExists || index < data.items.length,
  { maxSize: 1 },
);

const makeRow = <I extends Item, E extends {}>(
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

export const InfiniteWindow = <I extends Item, P extends string, E extends {}>({
  page,
  isMobile,
  items,
  MemoisedItem,
}: Props<I, P, E>): React.ReactElement<Props<I, P, E>> => {
  const dispatch = useDispatch();
  const olderExists = useSelector(getOlderExists(page));
  const itemCount = olderExists ? items.length + 1 : items.length;
  const loadMore = useCallback(async (): Promise<void> => {
    dispatch(moreListDataRequestInitiated(page));
  }, [dispatch, page]);

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
