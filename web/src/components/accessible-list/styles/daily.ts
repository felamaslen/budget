import styled from 'styled-components';

import { HeaderColumn } from './shared';
import { rem } from '~client/styled/mixins';

export const DailyTotal = styled.span`
  margin-left: ${rem(4)};
`;

export const WeeklyHeader = styled(HeaderColumn)`
  flex-basis: auto;
  margin-right: ${rem(4)};
  min-width: ${rem(64)};
`;
