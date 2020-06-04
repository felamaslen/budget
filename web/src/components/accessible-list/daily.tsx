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
import { Fields, HeaderProps, FieldKey } from './types';
import {
  FormFieldText,
  FormFieldTextInline,
  makeInlineTextField,
  FormFieldCost,
  FormFieldDate,
} from '~client/components/form-field';
import { ModalFields, makeField, FieldWrapper } from '~client/components/modal-dialog';
import { formatCurrency } from '~client/modules/format';
import { ShopItem } from '~client/types';

type DailyItem<K extends Exclude<string, keyof ShopItem>> = ShopItem &
  {
    [k in K]: string;
  };
type DailyFields<K extends string> = Fields<DailyItem<K>>;

type PropsDaily<P extends string, K extends Exclude<string, 'id'>> = Pick<
  PropsStandard<DailyItem<K>, P>,
  'page' | 'color'
> & {
  category?: K;
};

type DailyRecord = {
  dailyTotal?: number;
};

const dailySelector = moize(
  <K extends string>(sortedItems: DailyItem<K>[]): Record<string, DailyRecord> =>
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

const DailyHeader = <P extends string, K extends string, MK extends keyof DailyItem<K>>(
  props: HeaderProps<DailyItem<K>, P, MK>,
): React.ReactElement<HeaderProps<DailyItem<K>, P, MK>> => {
  const weeklyValue = useSelector(getWeeklyCost(props.page));

  return (
    <StandardHeader<DailyItem<K>, P, MK> {...props}>
      {!props.isMobile && <WeeklyHeader>Weekly: {formatCurrency(weeklyValue)}</WeeklyHeader>}
    </StandardHeader>
  );
};

const DailyRow: React.FC<{ isMobile: boolean } & Partial<DailyRecord & ExtraProps>> = ({
  isMobile,
  dailyTotal,
  isFuture,
  children,
}) => {
  return (
    <StandardRow isFuture={isFuture}>
      {children}
      {!isMobile && !!dailyTotal && <DailyTotal>{formatCurrency(dailyTotal)}</DailyTotal>}
    </StandardRow>
  );
};

export const AccessibleListDaily = <
  P extends string = string,
  K extends Exclude<string, keyof ShopItem> = 'category'
>({
  page,
  color,
  category = 'category' as K,
}: PropsDaily<P, K>): React.ReactElement<PropsDaily<P, K>> => {
  const fields = useMemo<DailyFields<K>>(
    (): DailyFields<K> =>
      ({
        date: standardFields.date,
        item: standardFields.item,
        [category]: FormFieldTextInline,
        cost: standardFields.cost,
        shop: FormFieldTextInline,
      } as DailyFields<K>),
    [category],
  );

  const modalFields = useMemo<ModalFields<DailyItem<K>>>(() => {
    const { Field: FormFieldCategory } = makeInlineTextField<DailyItem<K>[K]>();
    const CategoryField = makeField<DailyItem<K>[K]>(category, FormFieldCategory) as FieldWrapper<
      DailyItem<K>[K]
    >;

    const categoryFields = {
      [category]: CategoryField,
    } as ModalFields<DailyItem<K>> &
      {
        [key in K]: FieldWrapper<DailyItem<K>[K]>;
      };

    return {
      date: makeField('date', FormFieldDate),
      item: makeField('item', FormFieldText),
      ...categoryFields,
      cost: makeField('cost', FormFieldCost),
      shop: makeField('shop', FormFieldText),
    } as ModalFields<DailyItem<K>>;
  }, [category]);

  const suggestionFields = useMemo<FieldKey<DailyItem<K>>[]>(
    () => ['item' as const, category as Exclude<K, 'id'>, 'shop' as const],
    [category],
  );

  return (
    <AccessibleListStandard<P, DailyItem<K>, never, DailyRecord>
      page={page}
      color={color}
      fields={fields}
      modalFields={modalFields}
      suggestionFields={suggestionFields}
      customSelector={dailySelector}
      Header={DailyHeader}
      Row={DailyRow}
    />
  );
};
