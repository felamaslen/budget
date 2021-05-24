import endOfDay from 'date-fns/endOfDay';
import startOfDay from 'date-fns/startOfDay';
import React, { CSSProperties, useMemo } from 'react';
import { useSelector } from 'react-redux';

import { AccessibleList } from './base';
import { standardFieldsMobile, StandardMobileKeys } from './mobile';
import {
  getStandardCost,
  StateStandard,
  sortStandardItems,
  getWeeklyCost,
  dailySelector,
} from './selectors';
import * as Styled from './styles';
import { FieldKey, HeaderProps, Fields, Props, ItemProcessor, DailyRecord } from './types';
import {
  FormFieldTextInline,
  FormFieldCostInline,
  FormFieldDateInline,
  FormFieldDate,
  FormFieldText,
  FormFieldCost,
} from '~client/components/form-field';
import { ModalFields, makeField } from '~client/components/modal-dialog';
import { useListCrudStandard } from '~client/hooks';
import { formatCurrency, capitalise } from '~client/modules/format';
import type {
  Create,
  ListItemStandardNative as ListItemStandard,
  StandardInput,
  WithIds,
} from '~client/types';
import type { ListItemStandardInput, PageListStandard } from '~client/types/gql';
import type { GQL, PickUnion } from '~shared/types';

export const standardFields: Fields<Create<ListItemStandard>> = {
  date: FormFieldDateInline,
  item: FormFieldTextInline,
  category: FormFieldTextInline,
  cost: FormFieldCostInline,
  shop: FormFieldTextInline,
};

const standardSuggestionFields: FieldKey<ListItemStandard>[] = ['item', 'category', 'shop'];

const deltaSeed = (): Partial<StandardInput> => ({
  date: startOfDay(new Date()),
});

export type ExtraProps = DailyRecord & {
  isFuture: boolean;
};

const makeItemProcessor = (now: Date): ItemProcessor<ListItemStandard, ExtraProps> => (
  item,
): Partial<ExtraProps> => ({
  isFuture: item.date > now,
});

export const StandardHeader: React.FC<
  HeaderProps<GQL<ListItemStandard>, PageListStandard, StandardMobileKeys>
> = ({ page, isMobile, fields, fieldsMobile, labels, children }) => {
  const total = useSelector<StateStandard<WithIds<ListItemStandard>, PageListStandard>, number>(
    getStandardCost(page),
  );
  const fieldKeys = isMobile ? fieldsMobile : fields;
  const weeklyValue = useSelector(getWeeklyCost(page));

  return (
    <Styled.StandardHeader data-testid="header">
      {fieldKeys.map((field) => (
        <Styled.HeaderColumn key={field} column={field}>
          {capitalise(labels?.[field] ?? field)}
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

export const AccessibleListStandard: React.FC<PropsStandard> = ({ page, color, labels }) => {
  const now = useMemo<Date>(() => endOfDay(new Date()), []);
  const itemProcessor = useMemo<
    Props<ListItemStandard, PageListStandard, StandardMobileKeys, ExtraProps>['itemProcessor']
  >(() => makeItemProcessor(now), [now]);
  const headerProps = useMemo(() => ({ labels }), [labels]);
  const modalFields = useMemo<ModalFields<ListItemStandard>>(
    () => ({
      date: makeField('date', FormFieldDate),
      item: makeField('item', FormFieldText),
      category: makeField('category', FormFieldText, labels?.category),
      cost: makeField('cost', FormFieldCost, labels?.cost),
      shop: makeField('shop', FormFieldText, labels?.shop),
    }),
    [labels],
  );

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
