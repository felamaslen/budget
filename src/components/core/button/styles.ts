import styled from 'styled-components';

import { colors } from '~/styled/variables';
import { rem } from '~/styled/mixins';
import { Digit } from '~/components/login-form-input/styles';

export const Button = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  margin: 0 ${rem(6)};
  padding: 0;
  flex-grow: 1;
  font-size: inherit;
  width: 100%;
  background: ${colors.green};
  border: none;
  border-radius: 3px;
  outline: none;
  text-transform: uppercase;
  font-weight: bold;
  cursor: pointer;

  ${Digit} & {
    display: flex;
    height: 100%;
    background: ${colors.shadowDark};
    color: ${colors.textMedium};
  }
`;
