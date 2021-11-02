import startOfDay from 'date-fns/startOfDay';
import capitalize from 'lodash/capitalize';
import React, { CSSProperties, useMemo } from 'react';
import { useSelector } from 'react-redux';

import { AccessibleList } from './base';
import {
  getStandardCost,
  StateStandard,
  sortStandardItems,
  getWeeklyCost,
  dailySelector,
} from './selectors';
import * as Styled from './styles';
import {
  FieldKey,
  HeaderProps,
  Fields,
  Props,
  ItemProcessor,
  DailyRecord,
  FieldsMobile,
} from './types';
import {
  FormFieldTextInline,
  FormFieldCostInline,
  FormFieldDateInline,
  FormFieldDate,
  FormFieldText,
  FormFieldCost,
} from '~client/components/form-field';
import { ModalFields, makeField } from '~client/components/modal-dialog';
import { useListCrudStandard, useToday } from '~client/hooks';
import { formatCurrency, formatItem } from '~client/modules/format';
import type {
  ListItemStandardNative as ListItemStandard,
  StandardInput,
  WithIds,
} from '~client/types';
import type { ListItemStandardInput, PageListStandard } from '~client/types/gql';
import type { Create, GQL, PickUnion } from '~shared/types';

export const standardFields: Fields<Create<ListItemStandard>> = {
  date: FormFieldDateInline,
  item: FormFieldTextInline,
  category: FormFieldTextInline,
  cost: FormFieldCostInline,
  shop: FormFieldTextInline,
};

type StandardFieldPropsMobile<
  V,
  E extends Record<string, unknown> = Record<string, unknown>,
> = Partial<E> & {
  field: string;
  value: V;
};

const StandardFieldMobile = <V, E extends Record<string, unknown> = Record<string, unknown>>({
  field,
  value,
}: StandardFieldPropsMobile<V, E>): React.ReactElement<StandardFieldPropsMobile<V, E>> => (
  <Styled.StandardFieldMobile field={field}>
    {formatItem(field as string, value)}
  </Styled.StandardFieldMobile>
);

export type StandardMobileKeys = 'date' | 'item' | 'cost';

export const standardFieldsMobile: FieldsMobile<ListItemStandard, StandardMobileKeys> = {
  date: StandardFieldMobile,
  item: StandardFieldMobile,
  cost: StandardFieldMobile,
};

export const standardSuggestionFields: FieldKey<ListItemStandard>[] = ['item', 'category', 'shop'];

export const deltaSeed = (): Partial<StandardInput> => ({
  date: startOfDay(new Date()),
});

export type ExtraProps = DailyRecord & {
  isFuture: boolean;
};

export const makeItemProcessor =
  <T extends ListItemStandard>(now: Date): ItemProcessor<T, ExtraProps> =>
  (item): Partial<ExtraProps> => ({
    isFuture: item.date > now,
  });

export const StandardHeader = <T extends GQL<ListItemStandard>>({
  page,
  isMobile,
  fields,
  fieldsMobile,
  labels,
  children,
}: HeaderProps<T, PageListStandard, StandardMobileKeys>): React.ReactElement => {
  const total = useSelector<StateStandard<WithIds<ListItemStandard>, PageListStandard>, number>(
    getStandardCost(page),
  );
  const fieldKeys = (isMobile ? fieldsMobile : fields) as (keyof T)[];
  const weeklyValue = useSelector(getWeeklyCost(page));

  return (
    <Styled.StandardHeader data-testid="header">
      {fieldKeys.map((field) => (
        <Styled.HeaderColumn key={field as string} column={field as string}>
          {capitalize(labels ? Reflect.get(labels, field) ?? field : field)}
        </Styled.HeaderColumn>
      ))}
      {children}
      {!isMobile && (
        <Styled.WeeklyHeader>Weekly: {formatCurrency(weeklyValue)}</Styled.WeeklyHeader>
      )}
      {!isMobile && (
        <Styled.HeaderColumn>
          Total: {formatCurrency(total, { abbreviate: true, precision: 1 })}
        </Styled.HeaderColumn>
      )}
    </Styled.StandardHeader>
  );
};

export const StandardRow: React.FC<
  { isMobile: boolean; style?: CSSProperties; odd?: boolean } & Partial<DailyRecord & ExtraProps>
> = ({ children, dailyTotal, isFuture, isMobile, odd, style }) => (
  <Styled.StandardRow style={style} odd={odd} isFuture={isFuture}>
    {children}
    {!isMobile && !!dailyTotal && (
      <Styled.DailyTotal>{formatCurrency(dailyTotal)}</Styled.DailyTotal>
    )}
  </Styled.StandardRow>
);

export type StandardLabels = Partial<
  Record<Exclude<keyof ListItemStandardInput, 'date' | 'item'>, string>
>;

export type PropsStandard = PickUnion<
  Props<StandardInput, PageListStandard, StandardMobileKeys, ExtraProps>,
  'page' | 'color'
> & {
  labels?: StandardLabels;
};

export function useModalFields(labels?: StandardLabels): ModalFields<ListItemStandard> {
  return useMemo<ModalFields<ListItemStandard>>(
    () => ({
      date: makeField('date', FormFieldDate),
      item: makeField('item', FormFieldText),
      category: makeField('category', FormFieldText, labels?.category),
      cost: makeField('cost', FormFieldCost, labels?.cost),
      shop: makeField('shop', FormFieldText, labels?.shop),
    }),
    [labels],
  );
}

export const AccessibleListStandard: React.FC<PropsStandard> = ({ page, color, labels }) => {
  const now = useToday();
  const itemProcessor = useMemo<
    Props<ListItemStandard, PageListStandard, StandardMobileKeys, ExtraProps>['itemProcessor']
  >(() => makeItemProcessor(now), [now]);
  const headerProps = useMemo(() => ({ labels }), [labels]);
  const modalFields = useModalFields(labels);

  const { onCreate, onUpdate, onDelete } = useListCrudStandard(page as PageListStandard);

  return (
    <AccessibleList<ListItemStandard, PageListStandard, StandardMobileKeys, ExtraProps>
      windowise
      page={page}
      onCreate={onCreate}
      onUpdate={onUpdate}
      onDelete={onDelete}
      color={color}
      fields={standardFields}
      fieldsMobile={standardFieldsMobile}
      modalFields={modalFields}
      sortItems={sortStandardItems}
      suggestionFields={standardSuggestionFields}
      deltaSeed={deltaSeed}
      customSelector={dailySelector}
      itemProcessor={itemProcessor}
      headerProps={headerProps}
      Row={StandardRow}
      Header={StandardHeader}
    />
  );
};
