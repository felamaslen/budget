import React from 'react';

import { Step } from './constants';

import * as Styled from './styles';
import { Button } from '~client/styled/shared/button';
import type { Id, NetWorthEntryInputNative as NetWorthEntryInput } from '~client/types';

export type Props = {
  add?: boolean;
  step: Step;
  id?: Id;
  item: NetWorthEntryInput;
  onDone: () => void;
};

export const FormContainer: React.FC<Props> = ({ add = false, step, children, onDone }) => (
  <Styled.FormContainer add={add}>
    <Styled.FormSection step={step}>{children}</Styled.FormSection>
    <Styled.FormNavigation>
      <Button onClick={onDone}>Done</Button>
    </Styled.FormNavigation>
  </Styled.FormContainer>
);
