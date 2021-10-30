import React from 'react';

import { ButtonCancel, ButtonDelete, H3 } from '~client/styled/shared';
import * as Styled from '~client/styled/shared/confirm';

export type Props = {
  onConfirm?: () => void;
  onCancel?: () => void;
  title: string;
};

export const ConfirmModal: React.FC<Props> = ({ title, onCancel, onConfirm }) => (
  <Styled.ConfirmModal>
    <H3>{title}</H3>
    <Styled.ConfirmButtons>
      <ButtonCancel onClick={onCancel}>Cancel</ButtonCancel>
      <ButtonDelete onClick={onConfirm}>Confirm</ButtonDelete>
    </Styled.ConfirmButtons>
  </Styled.ConfirmModal>
);
