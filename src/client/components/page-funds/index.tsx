import { useCallback, useMemo } from 'react';
import { useSelector } from 'react-redux';
import type { RouteComponentProps } from 'react-router';

import { CashRow } from './cash-row';
import { FundsContext } from './context';
import { FundHeader } from './header';
import { useTodayPrices } from './hooks';
import { FundNameMobile, FundDetailMobile } from './mobile';
import { FundRow } from './row';
import * as Styled from './styles';
import { FundProps, Sort, defaultSort, SortCriteria, PageFundsContext } from './types';
import { AccessibleList, Fields } from '~client/components/accessible-list';
import {
  FormFieldTextInline,
  FormFieldTransactions,
  FormFieldText,
  FormFieldNumber,
  FormFieldStockSplits,
} from '~client/components/form-field';
import { GraphFunds } from '~client/components/graph-funds';
import { makeField, ModalFields } from '~client/components/modal-dialog';
import { NowProvider, useIsMobile, useListCrudFunds, usePersistentState } from '~client/hooks';
import { pageColor } from '~client/modules/color';
import { isSold } from '~client/modules/data';
import {
  getFundsCache,
  getGainsForRow,
  getPricesForRow,
  getRowGains,
  getTodayPrices,
} from '~client/selectors';
import { colors } from '~client/styled/variables';
import { Delta, FundInputNative as FundInput, FundNative as Fund } from '~client/types';
import { PageNonStandard } from '~shared/constants';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const isSort = (value: any | Sort): value is Sort =>
  value !== null &&
  typeof value === 'object' &&
  Object.keys(value).length === 2 &&
  Reflect.has(value, 'criteria') &&
  Object.values(SortCriteria).includes(value.criteria) &&
  Reflect.has(value, 'direction') &&
  [-1, 1].includes(value.direction);

const fields = {
  item: FormFieldTextInline,
} as Fields<FundInput>;

const fieldsMobile = {
  item: FundNameMobile,
  transactions: FundDetailMobile,
};

const modalFields: ModalFields<FundInput> = {
  item: makeField('item', FormFieldText),
  transactions: makeField('transactions', FormFieldTransactions, undefined, true),
  stockSplits: makeField('stockSplits', FormFieldStockSplits, 'Stock splits', true),
  allocationTarget: makeField('allocationTarget', FormFieldNumber, 'Allocation'),
};

const deltaSeed = (): Delta<Fund> => ({
  transactions: [],
});

type ComposedProps = {
  [id: number]: Pick<FundProps, 'gain' | 'latestPrice' | 'prices'>;
};

const itemProcessor = (fund: FundInput): Pick<FundProps, 'isSold'> => ({
  isSold: isSold(fund.transactions),
});

type SortItems = (funds: Fund[], props: { [id: string]: Partial<FundProps> }) => Fund[];

const makeSortItems =
  ({ criteria, direction }: Sort): SortItems =>
  (funds, props): Fund[] =>
    [...funds].sort(
      ({ id: idA }, { id: idB }) =>
        direction * ((props[idB]?.gain?.[criteria] ?? 0) - (props[idA]?.gain?.[criteria] ?? 0)),
    );

export const Funds: React.FC<RouteComponentProps> = () => {
  const isMobile = useIsMobile();
  const lastScraped = useTodayPrices();
  const cache = useSelector(getFundsCache);
  const todayPrices = useSelector(getTodayPrices);
  const composedSelector = useCallback(
    (items: Fund[]): ComposedProps => {
      const { startTime, cacheTimes, prices } = cache;
      const rowGains = getRowGains(items, cache);
      return items.reduce<ComposedProps>(
        (last, item) => ({
          ...last,
          [item.id]: {
            gain: getGainsForRow(rowGains, item.id),
            latestPrice: todayPrices[item.id] ?? rowGains[item.id]?.price ?? null,
            prices: getPricesForRow(prices, item.id, startTime, cacheTimes),
          },
        }),
        {},
      );
    },
    [cache, todayPrices],
  );
  const [sort, setSort] = usePersistentState<Sort>(defaultSort, 'funds_sort', isSort);
  const sortItems = useMemo(() => makeSortItems(sort), [sort]);

  const { onCreate, onUpdate, onDelete } = useListCrudFunds();

  const context = useMemo<PageFundsContext>(
    () => ({
      sort,
      setSort,
      lastScraped,
    }),
    [sort, setSort, lastScraped],
  );

  return (
    <FundsContext.Provider value={context}>
      <NowProvider>
        <Styled.PageFunds>
          <AccessibleList<FundInput, PageNonStandard.Funds, 'item' | 'transactions', FundProps>
            page={PageNonStandard.Funds}
            onCreate={onCreate}
            onUpdate={onUpdate}
            onDelete={onDelete}
            color={pageColor(colors.funds.main)}
            fields={fields}
            fieldsMobile={fieldsMobile}
            modalFields={modalFields}
            deltaSeed={deltaSeed}
            itemProcessor={itemProcessor}
            customSelector={composedSelector}
            sortItemsPost={sortItems}
            Row={FundRow}
            Header={FundHeader}
            FirstItem={CashRow}
          />
          {!isMobile && <GraphFunds />}
        </Styled.PageFunds>
      </NowProvider>
    </FundsContext.Provider>
  );
};
export default Funds;
