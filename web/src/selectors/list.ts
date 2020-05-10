import { createSelector } from 'reselect';
import { compose } from '@typed/compose';
import isSameDay from 'date-fns/isSameDay';
import differenceInDays from 'date-fns/differenceInDays';

import { Page, PageList, PageListCalc } from '~client/types/app';
import { Item, ListCalcItem } from '~client/types/list';
import { State } from '~client/reducers';
import { RequestType, WithCrud, Request } from '~client/types/crud';
import { PAGES, PAGES_LIST } from '~client/constants/data';
import { getCurrentDate } from '~client/selectors/now';
import { getFundsCost } from '~client/selectors/funds';
import { withoutDeleted, getValueForTransmit } from '~client/modules/data';

type Params<P extends Page = PageListCalc> = { page: P };

export type SortedItem = ListCalcItem &
  Partial<{
    daily: number;
    total: number;
    firstPresent: boolean;
    future: boolean;
  }>;

const getPageProp = (_: State, { page }: Params<Page>): Page => page;
const getCalcPageProp = (_: State, { page }: Params<PageListCalc>): PageListCalc => page;

const getNonFilteredItems = (state: State, { page }: Params<PageList>): Item[] => state[page].items;
const getCalcNonFilteredItems = (state: State, { page }: Params): ListCalcItem[] =>
  state[page].items;

export const getAllPageRows = createSelector<State, Params, ListCalcItem[], ListCalcItem[]>(
  getCalcNonFilteredItems,
  withoutDeleted,
);

type ResultsCache = {
  [id: string]: SortedItem;
};

type PageCache = {
  [page in Page]?: {
    result: SortedItem[];
    now: Date;
    items: ListCalcItem[];
  };
};

type DailyCounts = Partial<{
  daily: number;
  dailySum: number;
}>;

type GetDaily = (last: number, item: ListCalcItem, index: number) => DailyCounts;

const makeGetDaily = (page: PageListCalc, items: ListCalcItem[]): GetDaily => {
  if (!PAGES[page].daily) {
    return (): DailyCounts => ({});
  }

  return (last, item, index): DailyCounts => {
    const sum = last + (item.cost ?? 0);
    if (
      (index < items.length - 1 && !isSameDay(item.date, items[index + 1].date)) ||
      index === items.length - 1
    ) {
      return { daily: sum, dailySum: 0 };
    }

    return { dailySum: sum };
  };
};

function makeMemoisedRowProcessor(): (
  page: PageListCalc,
  now: Date,
  items: WithCrud<ListCalcItem>[],
) => SortedItem[] {
  const resultsCache: ResultsCache = {};
  const perPageCache: PageCache = {};

  return (page: PageListCalc, now: Date, items: WithCrud<ListCalcItem>[]): SortedItem[] => {
    if (
      now === perPageCache[page]?.now &&
      items.length === perPageCache[page]?.items.length &&
      items.every((item, index) => item === perPageCache[page]?.items[index])
    ) {
      return perPageCache[page]?.result ?? [];
    }

    const sortedByDate = items
      .slice()
      .sort(({ date: dateA, id: idA }, { date: dateB, id: idB }) => {
        if (dateA < dateB) {
          return 1;
        }
        if (dateA > dateB) {
          return -1;
        }
        if (idA < idB) {
          return -1;
        }
        if (idA > idB) {
          return 1;
        }
        return 0;
      });

    const getDaily = makeGetDaily(page, sortedByDate);

    const [result] = sortedByDate.reduce(
      (
        [last, wasFuture, lastDailySum]: [SortedItem[], boolean, number],
        { __optimistic, ...item },
        index,
      ): [SortedItem[], boolean, number] => {
        const future = wasFuture && item.date > now;
        const firstPresent = wasFuture && !future;

        const { daily, dailySum } = getDaily(lastDailySum, item, index);
        const processedItem: SortedItem = {
          ...item,
          future,
          firstPresent,
          daily: PAGES[page].daily ? daily : undefined,
        };

        const cachedItem = resultsCache[item.id];

        if (
          cachedItem &&
          Object.keys(processedItem).length === Object.keys(cachedItem).length &&
          (Object.keys(processedItem) as (keyof SortedItem)[]).every(
            key => processedItem[key] === cachedItem[key],
          )
        ) {
          return [last.concat([cachedItem]), future, dailySum ?? 0];
        }

        resultsCache[item.id] = processedItem;

        return [last.concat([processedItem]), future, dailySum ?? 0];
      },
      [[], true, 0],
    );

    perPageCache[page] = { result, now, items };

    return result;
  };
}

const memoisedRowProcessor = makeMemoisedRowProcessor();

export const getSortedPageRows = createSelector<
  State,
  Params<PageListCalc>,
  PageListCalc,
  Date,
  ListCalcItem[],
  SortedItem[]
>(
  getCalcPageProp,
  getCurrentDate,
  getAllPageRows,
  (page: PageListCalc, now: Date, items: ListCalcItem[]): SortedItem[] => {
    return memoisedRowProcessor(page, now, items as WithCrud<ListCalcItem>[]);
  },
);

type NonFilteredItem = {
  page: PageList;
  items: Item[];
};

const getAllNonFilteredItems = (state: State): NonFilteredItem[] =>
  PAGES_LIST.map(page => ({
    page,
    items: getNonFilteredItems(state, { page }),
  }));

export const getWeeklyAverages = createSelector(
  [getCalcPageProp, getSortedPageRows],
  (page, rows) => {
    if (!(rows && PAGES[page].daily)) {
      return null;
    }

    // note that this is calculated only based on the visible data,
    // not past data

    const visibleTotal = rows.reduce((sum, { cost }) => sum + cost, 0);
    if (!rows.length) {
      return 0;
    }

    const lastDate = rows[0].date; // sorted descending
    const firstDate = rows[rows.length - 1].date;

    const numWeeks = differenceInDays(lastDate, firstDate) / 7;
    if (!numWeeks) {
      return 0;
    }

    return Math.round(visibleTotal / numWeeks);
  },
);

const getAllTimeTotal = (state: State, { page }: { page: Page }): number =>
  Reflect.get(state[page], 'total') ?? 0;

export const getTotalCost = createSelector(
  [getPageProp, getAllTimeTotal, getFundsCost],
  (page, total, fundsTotal) => {
    if (page === Page.funds) {
      return fundsTotal;
    }

    return total;
  },
);

const withTransmitValues = (requests: Request[]): Request[] =>
  requests.map(({ body = {}, ...rest }) => ({
    ...rest,
    body: Object.keys(body).reduce(
      (last, column) => ({
        ...last,
        [column]: getValueForTransmit(column, Reflect.get(body, column)),
      }),
      {},
    ),
  }));

type ItemPendingRequest<T extends RequestType> = WithCrud<Item> & { __optimistic: T };
const shouldRequest = <T extends RequestType>(requestType: RequestType) => (
  item: WithCrud<Item>,
): item is ItemPendingRequest<T> => item.__optimistic === requestType;

const withCreateRequests = (page: Page, rows: WithCrud<Item>[]) => (last: Request[]): Request[] =>
  last.concat(
    rows
      .filter(shouldRequest<RequestType.create>(RequestType.create))
      .map(({ id, __optimistic: type, ...body }) => ({
        type,
        fakeId: id,
        method: 'post',
        route: page,
        query: {},
        body,
      })),
  );

const withUpdateRequests = (page: Page, rows: WithCrud<Item>[]) => (last: Request[]): Request[] =>
  last.concat(
    rows
      .filter(shouldRequest<RequestType.update>(RequestType.update))
      .map(({ __optimistic: type, ...body }) => ({
        type,
        id: body.id,
        method: 'put',
        route: page,
        query: {},
        body,
      })),
  );

const withDeleteRequests = (page: Page, rows: WithCrud<Item>[]) => (last: Request[]): Request[] =>
  last.concat(
    rows.filter(shouldRequest<RequestType.delete>(RequestType.delete)).map(({ id }) => ({
      type: RequestType.delete,
      id,
      method: 'delete',
      route: page,
      query: {},
      body: { id },
    })),
  );

const getCrudRequestsByPage = (page: Page, items: WithCrud<Item>[]): Request[] =>
  compose(
    withTransmitValues,
    withCreateRequests(page, items),
    withUpdateRequests(page, items),
    withDeleteRequests(page, items),
  )([]);

export const getCrudRequests = createSelector<State, NonFilteredItem[], Request[]>(
  getAllNonFilteredItems,
  itemsByPage =>
    itemsByPage.reduce(
      (last: Request[], { page, items }): Request[] =>
        last.concat(getCrudRequestsByPage(page, items)),
      [],
    ),
);
