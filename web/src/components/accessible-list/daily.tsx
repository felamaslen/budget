import isSameDay from 'date-fns/isSameDay';
import moize from 'moize';
import React, { useMemo } from 'react';
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
import { ExtendedCalcItem, Create } from '~client/types';

type DailyFields = Fields<ExtendedCalcItem>;

type PropsDaily<P extends string> = Pick<PropsStandard<ExtendedCalcItem, P>, 'page' | 'color'> & {
  categoryLabel?: string;
};

type DailyRecord = {
  dailyTotal?: number;
};

const dailySelector = moize(
  (sortedItems: ExtendedCalcItem[]): Record<string, DailyRecord> =>
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

const DailyHeader = <P extends string, MK extends keyof ExtendedCalcItem>(
  props: HeaderProps<ExtendedCalcItem, P, MK>,
): React.ReactElement<HeaderProps<ExtendedCalcItem, P, MK>> => {
  const weeklyValue = useSelector(getWeeklyCost(props.page));

  return (
    <StandardHeader<ExtendedCalcItem, P, MK> {...props}>
      {!props.isMobile && <WeeklyHeader>Weekly: {formatCurrency(weeklyValue)}</WeeklyHeader>}
    </StandardHeader>
  );
};

const DailyRow: React.FC<
  { isMobile: boolean; style?: object; odd?: boolean } & Partial<DailyRecord & ExtraProps>
> = ({ style, odd, isMobile, dailyTotal, isFuture, children }) => {
  return (
    <StandardRow style={style} odd={odd} isFuture={isFuture}>
      {children}
      {!isMobile && !!dailyTotal && <DailyTotal>{formatCurrency(dailyTotal)}</DailyTotal>}
    </StandardRow>
  );
};

const fields: DailyFields = {
  date: standardFields.date,
  item: standardFields.item,
  category: FormFieldTextInline,
  cost: standardFields.cost,
  shop: FormFieldTextInline,
};

const suggestionFields = ['item', 'category', 'shop'] as (keyof Create<ExtendedCalcItem>)[];

export const AccessibleListDaily = <P extends string = string>({
  page,
  color,
  categoryLabel = 'category',
}: PropsDaily<P>): React.ReactElement<PropsDaily<P>> => {
  const modalFields = useMemo<ModalFields<ExtendedCalcItem>>(
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
    <AccessibleListStandard<P, ExtendedCalcItem, never, DailyRecord>
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
