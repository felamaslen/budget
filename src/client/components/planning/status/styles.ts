import styled from '@emotion/styled';
import { rem } from 'polished';

import { FlexCenter } from '~client/styled/shared';
import { colors } from '~client/styled/variables';

export const StatusBar = styled(FlexCenter)`
  background: ${colors.light.light};
  border-top: 1px solid ${colors.light.mediumDark};
  flex: 0 0 ${rem(24)};
  padding: 0 ${rem(8)};
`;
