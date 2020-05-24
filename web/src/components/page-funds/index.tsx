import React, { useMemo } from 'react';
import { useSelector } from 'react-redux';

import { FundHeader } from './header';
import { FundNameMobile, FundDetailMobile } from './mobile';
import { FundRow } from './row';
import * as Styled from './styles';
import { FundProps } from './types';
import { AccessibleList, Fields } from '~client/components/accessible-list';
import {
  FormFieldTextInline,
  FormFieldTransactions,
  FormFieldTransactionsInline,
  FormFieldText,
} from '~client/components/FormField';
import { makeField } from '~client/components/ModalDialog';
import GraphFunds from '~client/containers/graph-funds';
import { useIsMobile } from '~client/hooks/media';
import { pageColor } from '~client/modules/color';
import { isSold } from '~client/modules/data';
import { Cache } from '~client/reducers/funds';
import {
  getCurrentFundsCache,
  getGainsForRow,
  getPricesForRow,
  getRowGains,
} from '~client/selectors';
import { colors } from '~client/styled/variables';
import { Page, Fund, Delta } from '~client/types';

const fields = {
  item: FormFieldTextInline,
  transactions: FormFieldTransactionsInline,
} as Fields<Fund>;

const fieldsMobile = {
  item: FundNameMobile,
  transactions: FundDetailMobile,
};

const modalFields = {
  item: makeField('item', FormFieldText),
  transactions: makeField('transactions', FormFieldTransactions),
};

const deltaSeed = (): Delta<Fund> => ({
  transactions: [],
});

type ComposedProps = {
  [id: string]: Pick<FundProps, 'gain' | 'prices'>;
};

const nullComposedProps: ComposedProps = {};
const makeComposedSelector = (cache?: Cache): ((items: Fund[]) => ComposedProps) => {
  if (!cache) {
    return (): ComposedProps => nullComposedProps;
  }

  const { startTime, cacheTimes, prices } = cache;

  return (items: Fund[]): ComposedProps => {
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
  };
};

const itemProcessor = (fund: Fund): Pick<FundProps, 'name' | 'isSold'> => ({
  name: fund.item,
  isSold: isSold(fund.transactions),
});

const sortItems = (funds: Fund[], props: { [id: string]: Partial<FundProps> }): Fund[] =>
  [...funds].sort(
    ({ id: idA }, { id: idB }) => (props[idB]?.gain?.value ?? 0) - (props[idA]?.gain?.value ?? 0),
  );

export const Funds: React.FC = () => {
  const isMobile = useIsMobile();
  const cache = useSelector(getCurrentFundsCache);
  const composedSelector = useMemo(() => makeComposedSelector(cache), [cache]);

  return (
    <Styled.PageFunds>
      <AccessibleList<Fund, Page.funds, 'item' | 'transactions', FundProps>
        page={Page.funds}
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
      />
      {!isMobile && <GraphFunds />}
    </Styled.PageFunds>
  );
};
