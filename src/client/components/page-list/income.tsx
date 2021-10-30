import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import type { RouteComponentProps } from 'react-router';

import * as Styled from './styles';
import { listDataReceived } from '~client/actions';
import { AccessibleList } from '~client/components/accessible-list';
import { dailySelector } from '~client/components/accessible-list/selectors';
import * as Standard from '~client/components/accessible-list/standard';
import * as StandardStyled from '~client/components/accessible-list/styles';
import type { Fields, HeaderProps, Props } from '~client/components/accessible-list/types';
import { FormFieldIncomeDeductions, FormFieldIncomeMetadata } from '~client/components/form-field';
import { makeField, ModalFields } from '~client/components/modal-dialog';
import { PAGE_LIST_LIMIT } from '~client/constants/data';
import { useListCrudIncome, useToday } from '~client/hooks';
import { pageColor } from '~client/modules/color';
import { sortByKey } from '~client/modules/data';
import { capitalise, formatCurrency } from '~client/modules/format';
import { getIncomeMetadata, getListOffset } from '~client/selectors';
import { Button, H4 } from '~client/styled/shared';
import { colors } from '~client/styled/variables';
import { PageListStandard } from '~client/types/enum';
import { Income, IncomeInput, useReadIncomeQuery } from '~client/types/gql';
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

const HeaderIncome: React.FC<HeaderIncomeProps> = ({ fields, fieldsMobile, isMobile }) => {
  const metadata = useSelector(getIncomeMetadata);
  const [showMetadata, setShowMetadata] = useState<boolean>(false);
  const toggleMetadata = useCallback(() => setShowMetadata((last) => !last), []);

  if (isMobile) {
    return (
      <StandardStyled.StandardHeader data-testid="header">
        {fieldsMobile.map((field) => (
          <StandardStyled.HeaderColumn key={field as string} column={field as string}>
            {capitalise(labels ? Reflect.get(labels, field) ?? field : field)}
          </StandardStyled.HeaderColumn>
        ))}
      </StandardStyled.StandardHeader>
    );
  }

  return (
    <StandardStyled.StandardHeader data-testid="header">
      {fields.map((field) => (
        <StandardStyled.HeaderColumn key={field as string} column={field as string}>
          {capitalise(labels ? Reflect.get(labels, field) ?? field : field)}
        </StandardStyled.HeaderColumn>
      ))}
      <StandardStyled.HeaderColumn>
        <Button onClick={toggleMetadata}>Metadata</Button>
        {showMetadata && (
          <Styled.IncomeMetadata>
            <Styled.IncomeMetadataRow>
              <Styled.IncomeMetadataLabel>Total</Styled.IncomeMetadataLabel>
              <Styled.IncomeMetadataValue>
                {formatCurrency(metadata.total, { abbreviate: true })}
              </Styled.IncomeMetadataValue>
              <Styled.IncomeMetadataInfo>[gross]</Styled.IncomeMetadataInfo>
            </Styled.IncomeMetadataRow>
            <Styled.IncomeMetadataRow>
              <Styled.IncomeMetadataLabel>Weekly</Styled.IncomeMetadataLabel>
              <Styled.IncomeMetadataValue>
                {formatCurrency(metadata.weekly, { abbreviate: false })}
              </Styled.IncomeMetadataValue>
              <Styled.IncomeMetadataInfo>[net]</Styled.IncomeMetadataInfo>
            </Styled.IncomeMetadataRow>
            <Styled.IncomeMetadataDeductions>
              <H4>Deductions</H4>
              {metadata.deductions.map(({ name, value }) => (
                <Styled.IncomeMetadataRow key={name}>
                  <Styled.IncomeMetadataLabel>{name}</Styled.IncomeMetadataLabel>
                  <Styled.IncomeMetadataValue>
                    {formatCurrency(-value, { abbreviate: true, brackets: true, precision: 1 })}
                  </Styled.IncomeMetadataValue>
                </Styled.IncomeMetadataRow>
              ))}
            </Styled.IncomeMetadataDeductions>
          </Styled.IncomeMetadata>
        )}
      </StandardStyled.HeaderColumn>
    </StandardStyled.StandardHeader>
  );
};

export function useIncomeItems(): () => Promise<void> {
  const dispatch = useDispatch();
  const offset = useSelector(getListOffset(PageListStandard.Income));

  const [{ data, fetching, stale }, fetchMore] = useReadIncomeQuery({
    pause: offset > 0,
    variables: {
      offset,
      limit: PAGE_LIST_LIMIT,
    },
  });

  useEffect(() => {
    if (data?.readIncome && !fetching && !stale) {
      dispatch(
        listDataReceived(PageListStandard.Income, data.readIncome, {
          totalDeductions: data.readIncome?.totalDeductions ?? [],
        }),
      );
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
