import styled from '@emotion/styled';
import { rem } from 'polished';

import * as Styled from '../styles';
import { Button } from '~client/styled/shared';
import { H3 } from '~client/styled/shared/typography';

export const IncomeEditForm = styled(Styled.AccountEditFormSection)``;
export const CreditEditForm = styled(Styled.AccountEditFormSection)``;

export const AddAccountForm = styled.div`
  display: grid;
  font-size: ${rem(13)};
  grid-template-rows: auto ${rem(22)} ${rem(22)} ${rem(28)};
  grid-template-columns: ${rem(80)} auto;
  width: 100%;

  ${H3} {
    grid-row: 1;
    grid-column: 1 / span 2;
  }
`;

const AddAccountLabel = styled.span`
  grid-column: 1;
  white-space: nowrap;
`;
export const AddAccountLabelAccount = styled(AddAccountLabel)`
  grid-row: 2;
`;
export const AddAccountLabelName = styled(AddAccountLabel)`
  grid-row: 3;
`;

const AddAccountInput = styled.div`
  grid-column: 2;
  &,
  input,
  select {
    max-width: ${rem(100)};
  }
`;
export const AddAccountInputAccount = styled(AddAccountInput)`
  grid-row: 2;
`;
export const AddAccountInputName = styled(AddAccountInput)`
  grid-row: 3;
`;

export const AddAccountButton = styled(Button)`
  grid-row: 4;
  grid-column: 1;
`;
