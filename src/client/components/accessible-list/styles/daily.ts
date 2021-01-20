import styled from '@emotion/styled';
import { rem } from 'polished';

import { HeaderColumn } from './shared';

export const DailyTotal = styled.span`
  line-height: inherit;
  margin-left: ${rem(4)};
`;

export const WeeklyHeader = styled(HeaderColumn)`
  flex-basis: auto;
  margin-right: ${rem(4)};
  min-width: ${rem(64)};
`;
