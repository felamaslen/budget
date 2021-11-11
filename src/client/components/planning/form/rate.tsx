import * as Styled from '../styles';

import { FormFieldCost } from '~client/components/form-field';
import { FormFieldNumberInline } from '~client/components/form-field/number';
import { PlanningTaxRateInput, PlanningTaxThresholdInput } from '~client/types/gql';

export type PropsRateForm = {
  label: string;
  name: string;
  rate: PlanningTaxRateInput | undefined;
  setRate: (name: string, value?: number) => void;
};

export const RateForm: React.FC<PropsRateForm> = ({ label, name, rate, setRate }) => (
  <Styled.RatesForm>
    <Styled.RatesLabel>{label}</Styled.RatesLabel>
    <Styled.RatesValue>
      <FormFieldNumberInline
        value={rate ? rate.value * 100 : undefined}
        onChange={(value = 0): void => setRate(name, value / 100)}
        min={0}
        max={100}
      />
      %
    </Styled.RatesValue>
  </Styled.RatesForm>
);

export type PropsThresholdForm = Pick<PropsRateForm, 'label' | 'name'> & {
  threshold: PlanningTaxThresholdInput | undefined;
  setThreshold: (name: string, value?: number) => void;
};

export const ThresholdForm: React.FC<PropsThresholdForm> = ({
  label,
  name,
  threshold,
  setThreshold,
}) => (
  <Styled.RatesForm>
    <Styled.RatesLabel>{label}</Styled.RatesLabel>
    <Styled.ThresholdsValue>
      <FormFieldCost
        value={threshold?.value ?? 0}
        onChange={(value): void => setThreshold(name, value)}
      />
    </Styled.ThresholdsValue>
  </Styled.RatesForm>
);
