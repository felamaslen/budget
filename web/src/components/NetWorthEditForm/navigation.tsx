import React from 'react';

import { Button } from '~client/styled/shared/button';
import * as Styled from './styles';

export type Props = {
  onPrevStep: () => void;
  onNextStep: () => void;
  onFirstStep: boolean;
  onLastStep: boolean;
};

const Navigation: React.FC<Props> = ({ onPrevStep, onNextStep, onFirstStep, onLastStep }) => (
  <Styled.FormNavigation>
    <Button onClick={onPrevStep} disabled={onFirstStep}>
      {'Previous'}
    </Button>
    <Button onClick={onNextStep}>{onLastStep ? 'Finish' : 'Next'}</Button>
  </Styled.FormNavigation>
);

export default Navigation;
