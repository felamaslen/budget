import styled from '@emotion/styled';
import { rem } from 'polished';

import { colors } from '~client/styled/variables';

export const StatusBar = styled.div`
  background: ${colors.light.light};
  border-top: 1px solid ${colors.light.mediumLight};
  flex: 0 0 ${rem(24)};
`;
