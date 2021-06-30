import formatDate from 'date-fns/format';
import React, { useCallback } from 'react';

import { Step } from './constants';
import type { Props as ContainerProps } from './form-container';
import * as Styled from './styles';

import { CTAEvents, useCTA } from '~client/hooks';
import { formatCurrency } from '~client/modules/format';
import { sumByType } from '~client/selectors/overview/net-worth';
import { Button, ButtonDelete } from '~client/styled/shared/button';
import { Flex } from '~client/styled/shared/layout';
import type { NetWorthEntryInputNative } from '~client/types';
import { NetWorthCategoryType } from '~client/types/enum';
import type { NetWorthCategory, NetWorthSubcategory } from '~client/types/gql';

export type Props = {
  categories: NetWorthCategory[];
  subcategories: NetWorthSubcategory[];
  onBack: () => void;
  onDelete?: () => void;
  onSave: () => void;
  item: NetWorthEntryInputNative;
  touched: boolean;
  setStep: React.Dispatch<React.SetStateAction<Step | null>>;
} & Pick<ContainerProps, 'add'>;

function useSetStepEvents(step: Step, setStep: Props['setStep']): CTAEvents {
  const setThisStep = useCallback(() => setStep(step), [step, setStep]);
  return useCTA(setThisStep);
}

const ValuesView: React.FC<{
  title: string;
  categoryType: NetWorthCategoryType;
  categories: NetWorthCategory[];
  subcategories: NetWorthSubcategory[];
  entry: NetWorthEntryInputNative;
  onActivate: CTAEvents;
}> = ({ title, categoryType, categories, subcategories, entry, onActivate }) => {
  const sumValue = sumByType(categoryType, categories, subcategories, entry);

  return (
    <Styled.OverviewSection {...onActivate}>
      <Styled.OverviewSectionTitle>{title}</Styled.OverviewSectionTitle>
      <p>{formatCurrency(sumValue, { brackets: true, abbreviate: true })}</p>
    </Styled.OverviewSection>
  );
};

export const StepOverview: React.FC<Props> = ({
  add = false,
  categories,
  subcategories,
  item,
  touched,
  onBack,
  onDelete,
  onSave,
  setStep,
}) => {
  const setStepDate = useSetStepEvents(Step.Date, setStep);
  const setStepCurrencies = useSetStepEvents(Step.Currencies, setStep);
  const setStepAssets = useSetStepEvents(Step.Assets, setStep);
  const setStepLiabilities = useSetStepEvents(Step.Liabilities, setStep);

  return (
    <Styled.FormContainer add={add}>
      <Styled.OverviewGrid>
        <Styled.OverviewSection {...setStepDate}>
          <Styled.OverviewSectionTitle>Date</Styled.OverviewSectionTitle>
          {formatDate(item.date, 'dd MMM yyyy')}
        </Styled.OverviewSection>
        <Styled.OverviewSection {...setStepCurrencies}>
          <Styled.OverviewSectionTitle>Currencies</Styled.OverviewSectionTitle>
          <ul>
            {item.currencies.map(({ currency, rate }) => (
              <li key={currency}>
                {currency} - {rate.toPrecision(5)}
              </li>
            ))}
          </ul>
        </Styled.OverviewSection>
        <ValuesView
          title="Assets"
          categoryType={NetWorthCategoryType.Asset}
          categories={categories}
          subcategories={subcategories}
          entry={item}
          onActivate={setStepAssets}
        />
        <ValuesView
          title="Liabilities"
          categoryType={NetWorthCategoryType.Liability}
          categories={categories}
          subcategories={subcategories}
          entry={item}
          onActivate={setStepLiabilities}
        />
      </Styled.OverviewGrid>
      <Styled.FormNavigation>
        <Flex>
          <Button onClick={onBack}>{touched ? 'Cancel' : 'Back'}</Button>
          <Button onClick={onSave} disabled={!touched}>
            Save
          </Button>
        </Flex>
        {!!onDelete && (
          <Flex>
            <ButtonDelete onClick={onDelete}>Delete</ButtonDelete>
          </Flex>
        )}
      </Styled.FormNavigation>
    </Styled.FormContainer>
  );
};
