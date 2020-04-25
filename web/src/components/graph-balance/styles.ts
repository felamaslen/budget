import styled, { css, FlattenSimpleInterpolation } from 'styled-components';
import { colors } from '~client/styled/variables';

export const ShowAll = styled.span`
  position: absolute;
  right: 0;
  top: 0;
  font-size: 0.9em;
  line-height: 20px;
  padding: 0.1em 0.2em;
  background: ${colors['translucent-l4'] as string};
  cursor: pointer;
  user-select: none;
  span {
    vertical-align: middle;
  }
`;

export const CheckBox = styled.a<{ enabled: boolean }>`
  width: 20px;
  height: 20px;
  float: left;
  position: relative;
  &:before {
    left: 4px;
    top: 4px;
    width: 12px;
    height: 12px;
    box-shadow: 0 0 0 1px black;
  }
  &:after {
    left: 7px;
    top: 7px;
    width: 6px;
    height: 6px;
    ${({ enabled }): false | FlattenSimpleInterpolation =>
      enabled &&
      css`
        background: black;
      `}
  }
  &:before,
  &:after {
    content: '';
    position: absolute;
    border-radius: 100%;
  }
`;
