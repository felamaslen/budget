import isSameDay from 'date-fns/isSameDay';
import moize from 'moize';
import React, { CSSProperties, useMemo } from 'react';
import { useSelector } from 'react-redux';

import { getWeeklyCost } from './selectors';
import {
  AccessibleListStandard,
  PropsStandard,
  standardFields,
  StandardHeader,
  ExtraProps,
} from './standard';
import { WeeklyHeader, StandardRow, DailyTotal } from './styles';
import { Fields, HeaderProps } from './types';
import {
  FormFieldText,
  FormFieldTextInline,
  FormFieldCost,
  FormFieldDate,
} from '~client/components/form-field';
import { ModalFields, makeField } from '~client/components/modal-dialog';
import { formatCurrency } from '~client/modules/format';
import {
  GQL,
  ListItemExtendedNative as ListItemExtended,
  ListItemStandardInput,
  PageListCost,
  StandardInput,
} from '~client/types';

type ListItemExtendedInput = Omit<ListItemExtended, 'id'>;

type DailyFields = Fields<ListItemExtendedInput>;

type PropsDaily<P extends PageListCost> = Pick<
  PropsStandard<StandardInput, P>,
  'page' | 'color'
> & {
  categoryLabel?: string;
};

type DailyRecord = {
  dailyTotal?: number;
};

const dailySelector = moize(
  (sortedItems: ListItemExtended[]): Record<string, DailyRecord> =>
    sortedItems.reduce<{ dailySum: number; record: Record<string, DailyRecord> }>(
      (last, { id, date, cost }, index) => {
        if (index === sortedItems.length - 1 || !isSameDay(date, sortedItems[index + 1].date)) {
          return {
            dailySum: 0,
            record: { ...last.record, [id]: { dailyTotal: last.dailySum + cost } },
          };
        }

        return { dailySum: last.dailySum + cost, record: last.record };
      },
      {
        dailySum: 0,
        record: {},
      },
    ).record,
  {
    maxSize: 1,
  },
);

const DailyHeader = <P extends PageListCost, MK extends keyof ListItemExtended>(
  props: HeaderProps<ListItemExtended, P, MK>,
): React.ReactElement<HeaderProps<ListItemExtended, P, MK>> => {
  const weeklyValue = useSelector(getWeeklyCost(props.page));

  return (
    <StandardHeader<ListItemExtended, P, MK> {...props}>
      {!props.isMobile && <WeeklyHeader>Weekly: {formatCurrency(weeklyValue)}</WeeklyHeader>}
    </StandardHeader>
  );
};

const DailyRow: React.FC<
  { isMobile: boolean; style?: CSSProperties; odd?: boolean } & Partial<DailyRecord & ExtraProps>
> = ({ style, odd, isMobile, dailyTotal, isFuture, children }) => (
  <StandardRow style={style} odd={odd} isFuture={isFuture}>
    {children}
    {!isMobile && !!dailyTotal && <DailyTotal>{formatCurrency(dailyTotal)}</DailyTotal>}
  </StandardRow>
);

const fields: DailyFields = {
  date: standardFields.date,
  item: standardFields.item,
  category: FormFieldTextInline,
  cost: standardFields.cost,
  shop: FormFieldTextInline,
};

const suggestionFields: Exclude<keyof GQL<ListItemStandardInput>, 'fakeId'>[] = [
  'item',
  'category',
  'shop',
];

export const AccessibleListDaily = <P extends PageListCost = PageListCost>({
  page,
  color,
  categoryLabel = 'category',
}: PropsDaily<P>): React.ReactElement<PropsDaily<P>> => {
  const modalFields = useMemo<ModalFields<ListItemExtendedInput>>(
    () => ({
      date: makeField('date', FormFieldDate),
      item: makeField('item', FormFieldText),
      category: makeField('category', FormFieldText, categoryLabel),
      cost: makeField('cost', FormFieldCost),
      shop: makeField('shop', FormFieldText),
    }),
    [categoryLabel],
  );

  return (
    <AccessibleListStandard<P, ListItemExtendedInput, never, DailyRecord>
      page={page}
      color={color}
      fields={fields}
      modalFields={modalFields}
      suggestionFields={suggestionFields}
      customSelector={dailySelector}
      categoryLabel={categoryLabel}
      Header={DailyHeader}
      Row={DailyRow}
    />
  );
};
