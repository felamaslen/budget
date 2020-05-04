import styled, { css, FlattenSimpleInterpolation } from 'styled-components';
import { breakpoints, colors } from '~client/styled/variables';
import { breakpoint } from '~client/styled/mixins';
import { Cell } from '~client/components/ListRowCell/styles';

export const Editable = styled.span<{ active: boolean; item: string }>`
  text-align: left;
  ${({ active }): false | FlattenSimpleInterpolation =>
    active &&
    css`
      position: relative;
    `};

  ${breakpoint(breakpoints.mobile)} {
    flex: 1 1 auto;
    white-space: nowrap;
    overflow-x: hidden;
    text-overflow: ellipsis;
    text-align: ${({ item }): 'right' | 'left' => {
      if (['value', 'cost'].includes(item)) {
        return 'right';
      }

      return 'left';
    }};

    ${({ active }): false | FlattenSimpleInterpolation =>
      active &&
      css`
        overflow: visible;
      `};

    ${({ item }): false | FlattenSimpleInterpolation =>
      item === 'transactions' &&
      css`
        position: relative;
      `};

    input {
      margin: 0;
      padding: 0;
      min-width: 10px;
      width: 100%;
      border: 0;
      padding: 0;
      outline: none;
      font: inherit;
      text-align: left;
      box-shadow: inset 0 0 0px 1px ${colors['editable-highlight']};
    }

    ${Cell} & {
      border-right: 1px solid ${colors['slightly-light']};
      height: inherit;
    }
  }
`;
