import styled, { css, FlattenSimpleInterpolation } from 'styled-components';

import { Row } from './shared';
import { rem } from '~client/styled/mixins';
import { colors } from '~client/styled/variables';

export const StandardHeader = styled.div.attrs({
  role: 'heading',
})`
  display: flex;
  font-size: ${rem(16)};
`;

export const StandardRow = styled(Row)<{
  isFuture?: boolean;
}>`
  ${({ isFuture }): false | FlattenSimpleInterpolation =>
    !!isFuture &&
    css`
      input {
        color: ${colors.dark.light};
        font-style: italic;
      }
    `}
`;
