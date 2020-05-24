import styled from 'styled-components';

import { rem } from '~client/styled/mixins';
import { ListWithoutMargin } from '~client/styled/shared/layout';
import { colors } from '~client/styled/variables';

export const SuggestionList = styled(ListWithoutMargin)`
  background-color: ${colors['translucent-l95']};
  border-radius: 0 2px 2px 0;
  border-top: none;
  box-shadow: 0 1px 4px ${colors['shadow-l3']};
  display: flex;
  flex-flow: column;
  left: 0;
  position: absolute;
  top: ${rem(24)};
  width: 100%;
  z-index: 2;
`;

export const SuggestionButton = styled.button`
  background: none;
  border: none;
  display: block;
  height: ${rem(24)};
  line-height: ${rem(24)};
  font-size: ${rem(14)};
  outline: none;
  overflow: hidden;
  margin: 0;
  padding: 0;
  text-align: left;
  text-overflow: ellipsis;
  white-space: nowrap;
  width: 100%;

  &:focus {
    background: ${colors.blue};
    color: ${colors.white};
  }
`;
