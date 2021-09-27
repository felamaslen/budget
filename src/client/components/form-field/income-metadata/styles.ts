import styled from '@emotion/styled';
import { rem } from 'polished';

import * as StyledCommon from '../metadata/styles';

const incomeDeductionWidthName = 104;
const incomeDeductionWidthValue = 96;

export const DeductionLabel = styled(StyledCommon.ComponentCol)`
  flex: 0 0 ${rem(incomeDeductionWidthName)};
`;

export const DeductionRowName = styled(StyledCommon.ComponentRow)`
  ${StyledCommon.componentItem(incomeDeductionWidthName)};
`;

export const DeductionRowValue = styled(StyledCommon.ComponentRow)`
  ${StyledCommon.componentItem(incomeDeductionWidthValue)};
`;

export const ModalHeadDeductionName = styled(StyledCommon.ModalHeadColumn)`
  ${StyledCommon.componentItem(incomeDeductionWidthName)};
`;

export const ModalHeadDeductionValue = styled(StyledCommon.ModalHeadColumn)`
  ${StyledCommon.componentItem(incomeDeductionWidthValue)};
`;
