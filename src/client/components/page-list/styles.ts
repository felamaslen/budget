import styled from '@emotion/styled';
import { rem } from 'polished';

import { HeaderColumn } from '~client/components/accessible-list/styles';
import { FlexColumn, H4 } from '~client/styled/shared';
import { colors } from '~client/styled/variables';

export const IncomeMetadataContainer = styled(HeaderColumn)`
  position: relative;
`;

export const IncomeMetadata = styled(FlexColumn)`
  background: ${colors.translucent.light.light};
  border: 1px solid ${colors.light.mediumDark};
  border-radius: 0 ${rem(2)} ${rem(2)} 0;
  border-top: none;
  padding: ${rem(2)} ${rem(5)};
  position: absolute;
  z-index: 10;
`;

export const IncomeMetadataRow = styled.div`
  display: flex;
`;

export const IncomeMetadataLabel = styled.span`
  margin-right: ${rem(8)};
`;
export const IncomeMetadataValue = styled.span`
  flex: 1;
`;
export const IncomeMetadataInfo = styled.span`
  color: ${colors.dark.light};
  font-size: ${rem(12)};
  font-weight: normal;
  margin-left: ${rem(8)};
`;

export const IncomeMetadataDeductions = styled(FlexColumn)`
  color: ${colors.dark.mediumDark};
  font-size: ${rem(12)};
  font-weight: normal;

  ${H4} {
    font-style: italic;
  }

  ${IncomeMetadataLabel} {
    flex: 1;
  }
`;
