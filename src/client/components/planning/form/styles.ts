import styled from '@emotion/styled';
import { rem } from 'polished';

import * as Styled from '../styles';
import { ButtonAdd, FlexColumn } from '~client/styled/shared';

export const IncomeEditForm = styled(Styled.AccountEditFormSection)``;
export const CreditEditForm = styled(Styled.AccountEditFormSection)`
  ${ButtonAdd} {
    flex: 0 0 auto;
  }
`;

export const ModifyAccountForm = styled(FlexColumn)`
  font-size: ${rem(13)};
`;

export const ModifyAccountFormRow = styled.div`
  display: grid;
  grid-template-rows: ${rem(22)};
  grid-template-columns: ${rem(80)} auto;
  overflow: hidden;
  width: 100%;

  input {
    width: 95%;
  }
`;

export const ModifyAccountFormLabel = styled.span`
  grid-column: 1;
  white-space: nowrap;
`;
export const ModifyAccountFormInput = styled.span`
  grid-column: 2;
`;
