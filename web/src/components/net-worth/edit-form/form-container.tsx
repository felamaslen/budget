import React from 'react';

import { Step } from './constants';
import Navigation, { Props as NavigationProps } from './navigation';

import * as Styled from './styles';
import { ButtonCancel } from '~client/styled/shared/button';
import { Id, NetWorthEntryInputNative as NetWorthEntryInput } from '~client/types';

export type Props = NavigationProps & {
  add?: boolean;
  step: Step;
  id?: Id;
  item: NetWorthEntryInput;
  onComplete: (event: React.MouseEvent) => void;
};

export const FormContainer: React.FC<Props> = ({
  add = false,
  step,
  children,
  onComplete,
  onPrevStep,
  onNextStep,
  onFirstStep,
  onLastStep,
}) => (
  <Styled.FormContainer add={add}>
    <ButtonCancel onClick={onComplete}>{'Cancel'}</ButtonCancel>
    <Styled.FormSection step={step}>{children}</Styled.FormSection>
    <Navigation
      onPrevStep={onPrevStep}
      onNextStep={onNextStep}
      onFirstStep={onFirstStep}
      onLastStep={onLastStep}
    />
  </Styled.FormContainer>
);
