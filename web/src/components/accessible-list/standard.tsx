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
  Fields,
  PropsItem,
  FieldsMobile,
  CustomSelector,
  Props,
} from './types';
import { FormFieldTextInline } from '~client/components/FormField';
import { FormFieldCostInline } from '~client/components/FormField/cost';
import { FormFieldDateInline } from '~client/components/FormField/date';
import { ModalFields } from '~client/components/ModalDialog';
import { formatCurrency, capitalise } from '~client/modules/format';
import { getCurrentDate } from '~client/selectors';
import { Delta, ListItem, PickUnion } from '~client/types';

export const standardFields = {
  date: FormFieldDateInline,
  item: FormFieldTextInline,
  cost: FormFieldCostInline,
};

const standardSuggestionFields: FieldKey<ListItem>[] = ['item'];

const deltaSeed = <I extends ListItem>(): Delta<I> =>
  ({
    date: startOfDay(new Date()),
  } as Delta<I>);

export type ExtraProps = {
  isFuture: boolean;
};

const makeItemProcessor = (now: Date) => (item: ListItem): Pick<ExtraProps, 'isFuture'> => ({
  isFuture: item.date > now,
});

export const StandardHeader = <I extends ListItem, P extends string, MK extends keyof I>({
  page,
  isMobile,
  fields,
  fieldsMobile,
  children,
}: React.PropsWithChildren<HeaderProps<I, P, MK>>): React.ReactElement<HeaderProps<I, P, MK>> => {
  const total = useSelector<StateStandard<I, P>, number>(getStandardCost(page));
  const fieldKeys = (isMobile ? fieldsMobile : fields) as string[];
  return (
    <StyledStandardHeader data-testid="header">
      {fieldKeys
        .filter((field) => field !== 'id')
        .map((field) => (
          <HeaderColumn key={field} column={field}>
            {capitalise(field as string)}
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

export type ExtraFields<I extends ListItem> = Omit<I, Exclude<keyof ListItem, 'id'>>;

export type PropsStandard<
  I extends ListItem,
  P extends string,
  MK extends keyof I = DefaultMobileKeys,
  E extends {} = {}
> = PickUnion<Props<I, P, MK, E>, 'page' | 'color' | 'modalFields'> & {
  fields?: Props<I, P, MK, E>['fields'];
  fieldsMobile?: FieldsMobile<I, MK, E>;
  suggestionFields?: FieldKey<I>[];
  customSelector?: CustomSelector<I, E>;
  Header?: React.FC<HeaderProps<I, P, MK>>;
  Row?: PropsItem<I, P, MK, E>['Row'];
};

export const AccessibleListStandard = <
  P extends string = string,
  I extends ListItem = ListItem,
  MK extends keyof I = DefaultMobileKeys,
  E extends {} = {}
>({
  page,
  color,
  fields = standardFields as Fields<I>,
  fieldsMobile = standardFieldsMobile as FieldsMobile<I, MK, E & ExtraProps>,
  modalFields = standardModalFields as ModalFields<I>,
  suggestionFields,
  customSelector,
  Header = StandardHeader,
  Row = StandardRow,
}: PropsStandard<I, P, MK, E & ExtraProps>): React.ReactElement<
  PropsStandard<I, P, MK, E & ExtraProps>
> => {
  const now = useSelector(getCurrentDate);
  const itemProcessor = useMemo(() => makeItemProcessor(now), [now]);
  const allSuggestionFields = useMemo<FieldKey<I>[]>(
    () => [...(suggestionFields ?? []), ...standardSuggestionFields] as FieldKey<I>[],
    [suggestionFields],
  );

  return (
    <AccessibleList<I, P, MK>
      page={page}
      color={color}
      fields={fields}
      fieldsMobile={fieldsMobile}
      modalFields={modalFields}
      sortItems={sortStandardItems<I>()}
      suggestionFields={allSuggestionFields}
      deltaSeed={deltaSeed}
      customSelector={customSelector}
      itemProcessor={itemProcessor}
      Row={Row}
      Header={Header}
    />
  );
};
