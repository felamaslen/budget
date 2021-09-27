import React, { useCallback, useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import type { RouteComponentProps } from 'react-router';
import { moreListDataReceived } from '~client/actions';
import { AccessibleList } from '~client/components/accessible-list';
import { dailySelector } from '~client/components/accessible-list/selectors';
import * as Standard from '~client/components/accessible-list/standard';
import type { Fields, HeaderProps, Props } from '~client/components/accessible-list/types';
import { FormFieldIncomeDeductions, FormFieldIncomeMetadata } from '~client/components/form-field';
import { makeField, ModalFields } from '~client/components/modal-dialog';
import { PAGE_LIST_LIMIT } from '~client/constants/data';
import { useListCrudIncome, useToday } from '~client/hooks';
import { pageColor } from '~client/modules/color';
import { sortByKey } from '~client/modules/data';
import { getListOffset } from '~client/selectors';
import { colors } from '~client/styled/variables';
import { PageListStandard } from '~client/types/enum';
import { Income, IncomeInput, useMoreIncomeDataQuery } from '~client/types/gql';
import type { GQL, NativeDate } from '~shared/types';

export type IncomeInputNative = GQL<NativeDate<IncomeInput, 'date'>>;
export type IncomeNative = GQL<NativeDate<Income, 'date'>>;

const incomeFields = {
  ...Standard.standardFields,
  deductions: FormFieldIncomeMetadata,
} as Fields<IncomeInputNative>;

const deltaSeed = (): Partial<IncomeInputNative> => ({
  ...Standard.deltaSeed(),
  deductions: [],
});

const labels: Standard.StandardLabels = {
  cost: 'Value',
  shop: 'Place',
};

const headerProps: Record<string, unknown> = {
  labels,
};

const sortIncome = sortByKey<'item' | 'date', IncomeNative>({ key: 'date', order: -1 }, 'item');

type HeaderIncomeProps = HeaderProps<
  GQL<IncomeNative>,
  PageListStandard.Income,
  Standard.StandardMobileKeys
>;

const HeaderIncome: React.FC<HeaderIncomeProps> = (props) => (
  <Standard.StandardHeader<GQL<IncomeNative>> {...props} page={PageListStandard.Income} />
);

function useIncomeItems(): () => Promise<void> {
  const dispatch = useDispatch();
  const offset = useSelector(getListOffset(PageListStandard.Income));

  const [{ data, fetching, stale }, fetchMore] = useMoreIncomeDataQuery({
    pause: offset > 0,
    variables: {
      offset,
      limit: PAGE_LIST_LIMIT,
    },
  });

  useEffect(() => {
    if (data?.readIncome && !fetching && !stale) {
      dispatch(moreListDataReceived(PageListStandard.Income, data.readIncome));
    }
  }, [dispatch, data, fetching, stale]);

  return useCallback(async (): Promise<void> => {
    fetchMore();
  }, [fetchMore]);
}

const PageIncome: React.FC<RouteComponentProps> = () => {
  const now = useToday();
  const itemProcessor = useMemo<
    Props<
      IncomeNative,
      PageListStandard.Income,
      Standard.StandardMobileKeys,
      Standard.ExtraProps
    >['itemProcessor']
  >(() => Standard.makeItemProcessor(now), [now]);
  const modalFieldsStandard = Standard.useModalFields(labels);
  const modalFields = useMemo<ModalFields<IncomeNative>>(
    () => ({
      ...modalFieldsStandard,
      deductions: makeField('deductions', FormFieldIncomeDeductions, 'Deductions', true),
    }),
    [modalFieldsStandard],
  );

  const { onCreate, onUpdate, onDelete } = useListCrudIncome();

  return (
    <AccessibleList<
      IncomeNative,
      PageListStandard.Income,
      Standard.StandardMobileKeys,
      Standard.ExtraProps
    >
      windowise
      page={PageListStandard.Income}
      useItems={useIncomeItems}
      onCreate={onCreate}
      onUpdate={onUpdate}
      onDelete={onDelete}
      color={pageColor(colors[PageListStandard.Income].main)}
      fields={incomeFields}
      fieldsMobile={Standard.standardFieldsMobile}
      modalFields={modalFields}
      sortItems={sortIncome}
      suggestionFields={Standard.standardSuggestionFields}
      deltaSeed={deltaSeed}
      customSelector={dailySelector}
      itemProcessor={itemProcessor}
      headerProps={headerProps}
      Row={Standard.StandardRow}
      Header={HeaderIncome}
    />
  );
};
export { PageIncome as Income };
export default PageIncome;
