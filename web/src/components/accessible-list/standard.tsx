import endOfDay from 'date-fns/endOfDay';
import startOfDay from 'date-fns/startOfDay';
import React, { useMemo } from 'react';
import { useSelector } from 'react-redux';

import { AccessibleList } from './base';
import { standardFieldsMobile, DefaultMobileKeys, standardModalFields } from './mobile';
import { getStandardCost, StateStandard, sortStandardItems } from './selectors';
import { StandardRow, StandardHeader as StyledStandardHeader, HeaderColumn } from './styles';
import {
  FieldKey,
  HeaderProps,
  PropsItem,
  FieldsMobile,
  CustomSelector,
  Props,
  ItemProcessor,
} from './types';
import {
  FormFieldTextInline,
  FormFieldCostInline,
  FormFieldDateInline,
} from '~client/components/form-field';
import { useListCrudStandard } from '~client/hooks';
import { formatCurrency, capitalise } from '~client/modules/format';
import {
  ListItem,
  PageListCost,
  PageListStandard,
  PickUnion,
  StandardInput,
  WithIds,
} from '~client/types';

export const standardFields = {
  date: FormFieldDateInline,
  item: FormFieldTextInline,
  cost: FormFieldCostInline,
};

const standardSuggestionFields: FieldKey<ListItem>[] = ['item'];

const deltaSeed = <I extends StandardInput>(): Partial<I> =>
  ({
    date: startOfDay(new Date()),
  } as Partial<I>);

export type ExtraProps = {
  isFuture: boolean;
};

const makeItemProcessor = <I extends StandardInput, E extends ExtraProps>(
  now: Date,
): ItemProcessor<I, E> => (item): Partial<E> =>
  ({
    isFuture: item.date > now,
  } as Partial<E>);

export const StandardHeader = <
  I extends StandardInput,
  P extends PageListCost,
  MK extends keyof I
>({
  page,
  isMobile,
  fields,
  fieldsMobile,
  categoryLabel = 'category',
  children,
}: React.PropsWithChildren<HeaderProps<I, P, MK>>): React.ReactElement<HeaderProps<I, P, MK>> => {
  const total = useSelector<StateStandard<WithIds<I>, P>, number>(getStandardCost(page));
  const fieldKeys = (isMobile ? fieldsMobile : fields) as string[];
  return (
    <StyledStandardHeader data-testid="header">
      {fieldKeys
        .filter((field) => field !== 'id')
        .map((field) => (
          <HeaderColumn key={field} column={field}>
            {capitalise(field === 'category' ? categoryLabel : (field as string))}
          </HeaderColumn>
        ))}
      {children}
      {!isMobile && (
        <HeaderColumn>
          Total: {formatCurrency(total, { abbreviate: true, precision: 1 })}
        </HeaderColumn>
      )}
    </StyledStandardHeader>
  );
};

export type PropsStandard<
  I extends StandardInput,
  P extends PageListCost,
  MK extends keyof I = DefaultMobileKeys,
  E extends Record<string, unknown> = never
> = PickUnion<Props<I, P, MK, E & ExtraProps>, 'page' | 'color' | 'modalFields'> & {
  fields?: Props<I, P, MK, E & ExtraProps>['fields'];
  fieldsMobile?: FieldsMobile<I, MK, E & ExtraProps>;
  suggestionFields?: FieldKey<I>[];
  customSelector?: CustomSelector<I, E>;
  categoryLabel?: string;
  Header?: React.FC<HeaderProps<I, P, MK>>;
  Row?: PropsItem<I, P, MK, E & ExtraProps>['Row'];
};

export const AccessibleListStandard = <
  P extends PageListCost = PageListCost,
  I extends StandardInput = StandardInput,
  MK extends keyof I = DefaultMobileKeys,
  E extends Record<string, unknown> = Record<string, unknown>
>({
  page,
  color,
  fields = standardFields as Props<I, P, MK, E & ExtraProps>['fields'],
  fieldsMobile = standardFieldsMobile as FieldsMobile<I, MK, E & ExtraProps>,
  modalFields = (standardModalFields as unknown) as Props<I, P, MK, E & ExtraProps>['modalFields'],
  suggestionFields,
  customSelector,
  categoryLabel = 'category',
  Header = StandardHeader as Props<I, P, MK>['Header'],
  Row = StandardRow as PropsStandard<I, P, MK, E>['Row'],
}: PropsStandard<I, P, MK, E & ExtraProps>): React.ReactElement<
  PropsStandard<I, P, MK, E & ExtraProps>
> => {
  const now = useMemo<Date>(() => endOfDay(new Date()), []);
  const itemProcessor = useMemo<Props<I, P, MK, E & ExtraProps>['itemProcessor']>(
    () => makeItemProcessor(now),
    [now],
  );
  const allSuggestionFields = useMemo<FieldKey<I>[]>(
    () => [...(suggestionFields ?? []), ...standardSuggestionFields] as FieldKey<I>[],
    [suggestionFields],
  );
  const headerProps = useMemo(() => ({ categoryLabel }), [categoryLabel]);

  const { onCreate, onUpdate, onDelete } = useListCrudStandard(page as PageListStandard);

  return (
    <AccessibleList<I, P, MK, E & ExtraProps>
      windowise
      page={page}
      onCreate={onCreate}
      onUpdate={onUpdate}
      onDelete={onDelete}
      color={color}
      fields={fields}
      fieldsMobile={fieldsMobile}
      modalFields={modalFields}
      sortItems={sortStandardItems<WithIds<I>>()}
      suggestionFields={allSuggestionFields}
      deltaSeed={deltaSeed}
      customSelector={customSelector}
      itemProcessor={itemProcessor}
      headerProps={headerProps}
      Row={Row}
      Header={Header}
    />
  );
};
