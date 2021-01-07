import React, { useCallback, useContext, useMemo } from 'react';
import { useSelector } from 'react-redux';

import { CashRow } from './cash-row';
import { FundHeader } from './header';
import { useTodayPrices } from './hooks';
import { FundNameMobile, FundDetailMobile } from './mobile';
import { FundRow } from './row';
import * as Styled from './styles';
import { FundProps, Sort, defaultSort, HeadProps, SortCriteria } from './types';
import { AccessibleList, Fields } from '~client/components/accessible-list';
import {
  FormFieldTextInline,
  FormFieldTransactions,
  FormFieldTransactionsInline,
  FormFieldText,
  FormFieldNumber,
} from '~client/components/form-field';
import { GraphFunds } from '~client/components/graph-funds';
import { makeField, ModalFields } from '~client/components/modal-dialog';
import { TodayContext, useIsMobile, useListCrudFunds, usePersistentState } from '~client/hooks';
import { pageColor } from '~client/modules/color';
import { isSold } from '~client/modules/data';
import { getFundsCache, getGainsForRow, getPricesForRow, getRowGains } from '~client/selectors';
import { colors } from '~client/styled/variables';
import {
  Delta,
  FundInputNative as FundInput,
  FundNative as Fund,
  PageNonStandard,
} from '~client/types';

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
  transactions: FormFieldTransactionsInline,
} as Fields<FundInput>;

const fieldsMobile = {
  item: FundNameMobile,
  transactions: FundDetailMobile,
};

const modalFields: ModalFields<FundInput> = {
  item: makeField('item', FormFieldText),
  transactions: makeField('transactions', FormFieldTransactions),
  allocationTarget: makeField('allocationTarget', FormFieldNumber, 'Allocation'),
};

const deltaSeed = (): Delta<Fund> => ({
  transactions: [],
});

type ComposedProps = {
  [id: number]: Pick<FundProps, 'gain' | 'prices'>;
};

const itemProcessor = (fund: FundInput): Pick<FundProps, 'isSold'> => ({
  isSold: isSold(fund.transactions),
});

type SortItems = (funds: Fund[], props: { [id: string]: Partial<FundProps> }) => Fund[];

const makeSortItems = ({ criteria, direction }: Sort): SortItems => (funds, props): Fund[] =>
  [...funds].sort(
    ({ id: idA }, { id: idB }) =>
      direction * ((props[idB]?.gain?.[criteria] ?? 0) - (props[idA]?.gain?.[criteria] ?? 0)),
  );

export const Funds: React.FC = () => {
  const isMobile = useIsMobile();
  useTodayPrices();
  const today = useContext(TodayContext);
  const cache = useSelector(getFundsCache.today(today));
  const composedSelector = useCallback(
    (items: Fund[]): ComposedProps => {
      const { startTime, cacheTimes, prices } = cache;
      const rowGains = getRowGains(items, cache);
      return items.reduce<ComposedProps>(
        (last, item) => ({
          ...last,
          [item.id]: {
            gain: getGainsForRow(rowGains, item.id),
            prices: getPricesForRow(prices, item.id, startTime, cacheTimes),
          },
        }),
        {},
      );
    },
    [cache],
  );
  const [sort, setSort] = usePersistentState<Sort>(defaultSort, 'funds_sort', isSort);
  const sortItems = useMemo(() => makeSortItems(sort), [sort]);

  const { onCreate, onUpdate, onDelete } = useListCrudFunds();

  return (
    <Styled.PageFunds>
      <AccessibleList<
        FundInput,
        PageNonStandard.Funds,
        'item' | 'transactions',
        FundProps,
        HeadProps
      >
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
        headerProps={{ sort, setSort }}
        FirstItem={CashRow}
      />
      {!isMobile && <GraphFunds />}
    </Styled.PageFunds>
  );
};
export default Funds;
