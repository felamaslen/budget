import styled from '@emotion/styled';
import { rem } from 'polished';

import { ButtonCancel, ButtonDelete } from './button';
import { Flex, FlexColumn } from './layout';

import { colors } from '~client/styled/variables';

export const ConfirmModal = styled(FlexColumn)`
  background: ${colors.translucent.light.light};
  border: 1px solid ${colors.light.dark};
  box-shadow: 0 ${rem(2)} ${rem(8)} ${colors.shadow.mediumLight};
  max-width: ${rem(300)};
  padding: ${rem(4)} ${rem(8)};

  ${ButtonCancel}, ${ButtonDelete} {
    font-size: ${rem(12)};
    line-height: ${rem(18)};
    padding: ${rem(2)} ${rem(8)};
    position: static;
  }

  ${ButtonDelete} {
    border-radius: 3px;
    width: auto;
  }
`;

export const ConfirmButtons = styled(Flex)`
  justify-content: space-between;
  margin: ${rem(16)} 0 ${rem(8)} 0;
`;
