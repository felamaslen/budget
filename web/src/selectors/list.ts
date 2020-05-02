import { createSelector } from 'reselect';
import { compose } from '@typed/compose';
import { DateTime } from 'luxon';

import { Page, PageListCalc } from '~client/types/app';
import { State } from '~client/reducers';
import { Item, ListCalcItem } from '~client/reducers/list';
import { RequestType, WithCrud, Request } from '~client/types/crud';
import { PAGES, PAGES_LIST_CALC } from '~client/constants/data';
import { getCurrentDate } from '~client/selectors/now';
import { getFundsCost } from '~client/selectors/funds';
import { withoutDeleted, getValueForTransmit } from '~client/modules/data';

type Params = { page: PageListCalc };

type SortedItem = ListCalcItem &
  Partial<{
    daily: number;
    total: number;
    firstPresent: boolean;
    future: boolean;
  }>;

const getPageProp = (_: State, { page }: Params): PageListCalc => page;
const getAnyPageProp = (_: State, { page }: { page: Page }): Page => page;

const getNonFilteredItems = (state: State, { page }: Params): ListCalcItem[] => state[page].items;

export const getAllPageRows = createSelector<State, Params, ListCalcItem[], ListCalcItem[]>(
  getNonFilteredItems,
  withoutDeleted,
);

type ResultsCache = {
  [id: string]: SortedItem;
};

type PageCache = {
  [page in Page]?: {
    result: SortedItem[];
    now: DateTime;
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
      (index < items.length - 1 && !item.date.hasSame(items[index + 1].date, 'day')) ||
      index === items.length - 1
    ) {
      return { daily: sum, dailySum: 0 };
    }

    return { dailySum: sum };
  };
};

function makeMemoisedRowProcessor(): (
  page: PageListCalc,
  now: DateTime,
  items: WithCrud<ListCalcItem>[],
) => SortedItem[] {
  const resultsCache: ResultsCache = {};
  const perPageCache: PageCache = {};

  return (page: PageListCalc, now: DateTime, items: WithCrud<ListCalcItem>[]): SortedItem[] => {
    if (!items) {
      return [];
    }
    if (
      now === perPageCache[page]?.now &&
      items.length === perPageCache[page]?.items.length &&
      items.every((item, index) => item === perPageCache[page]?.items[index])
    ) {
      return perPageCache[page]?.result ?? [];
    }

    const sortedByDate = items
      .slice()
      .sort(({ date: dateA }, { date: dateB }) => Number(dateB) - Number(dateA));

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
  Params,
  PageListCalc,
  DateTime,
  ListCalcItem[],
  SortedItem[]
>(
  getPageProp,
  getCurrentDate,
  getAllPageRows,
  (page: PageListCalc, now: DateTime, items: ListCalcItem[]): SortedItem[] => {
    return memoisedRowProcessor(page, now, items as WithCrud<ListCalcItem>[]);
  },
);

type NonFilteredItem = {
  page: PageListCalc;
  items: ListCalcItem[];
};

const getAllNonFilteredItems = (state: State): NonFilteredItem[] =>
  PAGES_LIST_CALC.map(page => ({
    page,
    items: getNonFilteredItems(state, { page }),
  }));

export const getWeeklyAverages = createSelector([getPageProp, getSortedPageRows], (page, rows) => {
  if (!(rows && PAGES[page].daily)) {
    return null;
  }

  // note that this is calculated only based on the visible data,
  // not past data

  const visibleTotal = rows.reduce((sum, { cost }) => sum + cost, 0);
  if (!rows.length) {
    return 0;
  }

  const firstDate = rows[0].date;
  const lastDate = rows[rows.length - 1].date;

  const numWeeks = firstDate.diff(lastDate).as('days') / 7;
  if (!numWeeks) {
    return 0;
  }

  return Math.round(visibleTotal / numWeeks);
});

const getAllTimeTotal = (state: State, { page }: { page: Page }): number =>
  Reflect.get(state[page], 'total') ?? 0;

export const getTotalCost = createSelector(
  [getAnyPageProp, getAllTimeTotal, getFundsCost],
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
