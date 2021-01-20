import { css } from '@emotion/react';
import styled from '@emotion/styled';
import { rem } from 'polished';

import { Row } from './shared';
import { asHeading } from '~client/styled/shared/role';

export const StandardHeader = asHeading(styled.div`
  display: flex;
  font-size: ${rem(16)};
`);

export const StandardRow = styled(Row)<{
  isFuture?: boolean;
}>(
  ({ isFuture }) => css`
    line-height: ${rem(24)};
    ${!!isFuture && `opacity: 0.5;`}
  `,
);
