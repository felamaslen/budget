import styled, { css, FlattenSimpleInterpolation } from 'styled-components';
import { Graph } from '~client/components/graph/styles';
import { colors } from '~client/styled/variables';

export const Text = styled.span`
  display: inline-block;
`;

export const List = styled.div<{ isLoading: boolean }>`
  font-size: 0.8em;

  &::-webkit-scrollbar-track {
    -webkit-box-shadow: none;
  }
  &::-webkit-scrollbar-thumb {
    background-color: ${colors['translucent-l6']};
  }
  &::-webkit-scrollbar-thumb:hover {
    background-color: ${colors['shadow-l5']};
  }
  &::-webkit-scrollbar-thumb:active {
    background-color: ${colors['translucent-l7']};
  }
`;

export const StocksGraph = styled(Graph)`
  background: ${colors['very-dark']} !important;
  color: ${colors.white} !important;
  position: static;
  box-shadow: none;
  width: 260px;
  height: 50px;
`;

export const ListUl = styled.ul`
  margin: 0;
  width: 350px;
  height: 100%;
  overflow-y: scroll;
  float: left;
  padding: 0;
  list-style: none;
  font-size: 13pt;

  ${Text} {
    white-space: nowrap;
    line-height: 20px;
    vertical-align: top;
  }
`;

export const Sidebar = styled.div`
  width: 150px;
  height: 100%;
  float: right;
  text-align: right;

  .graph-container {
    width: auto;
    height: auto;
    box-shadow: none;
    position: static;
    background: none;
  }
`;

export const SidebarList = styled.ul`
  margin: 0;
  padding: 0;
  list-style: none;
`;

export const NameColumn = styled(Text)`
  width: 68%;
  text-overflow: ellipsis;
  overflow: hidden;

  ${Sidebar} & {
    width: 60%;
    color: ${colors.light};
    font-style: italic;
  }
`;

export const Code = styled(Text)`
  ${Sidebar} & {
    display: none;
  }
  ${NameColumn} & {
    margin: 1px;
    padding-right: 4px;
    line-height: 18px;
    color: ${colors.white};
    font-size: 11pt;
    background: ${colors['shadow-l3']};
  }
`;

const Value = styled(Text)`
  width: 16%;
  font-size: 10pt;
  color: ${colors.white};
  text-align: right;

  ${Sidebar} & {
    width: 40%;
  }
`;

export const Price = styled(Value)`
  ${Sidebar} & {
    display: none;
  }
`;

export const Change = styled(Value)`
  &::after {
    display: inline-block;
    width: 10px;
    height: 2px;
    flex: 0 0 10px;
    content: '';
    vertical-align: middle;
    background: turquoise;
  }
`;

export const Title = styled(Text)`
  ${Sidebar} & {
    &::after {
      content: ': ';
    }
  }

  ${NameColumn} & {
    color: ${colors['medium-very-light']};
    font-size: 8pt;
    width: 100%;
  }
`;

export const Item = styled.li<{ up: boolean; down: boolean; hlUp: boolean; hlDown: boolean }>`
  border-bottom: 1px solid ${colors.dark};
  padding-top: 1px;
  font-weight: ${({ hlUp, hlDown }): 'bold' | 'normal' => (hlUp || hlDown ? 'bold' : 'normal')};

  ${Change} {
    ${({ down }): false | string => down && `color: ${colors['bg-down']};`}
    ${({ up }): false | string => up && `color: ${colors['bg-up']};`}

    &::after {
      border-left: 5px solid transparent;
      border-right: 5px solid transparent;
      border-top: none;
      background: none;
      width: 0;
      height: 0;
      top: 3px;
      ${({ up, hlUp, hlDown }): false | FlattenSimpleInterpolation =>
        up &&
        css`
          border-bottom: 5px solid ${colors['bg-up']};
          ${hlUp && `background-color: ${colors['bg-up-hl']};`}
          ${hlDown && `background-color: ${colors['bg-up-rev']};`}
        `}
      ${({ down, hlUp, hlDown }): false | FlattenSimpleInterpolation =>
        down &&
        css`
          border-top: 5px solid ${colors['bg-down']};
          ${hlUp && `background-color: ${colors['bg-down-hl']};`}
          ${hlDown && `background-color: ${colors['bg-down-rev']};`}
        `}
    }
  }

  &:nth-child(2n + 1) {
    background: ${colors['very-dark-1']};
  }

  background-color: ${({ up, down, hlUp, hlDown }): string => {
    if (up) {
      if (hlUp) {
        return colors['bg-up-hl'];
      }
      if (hlDown) {
        return colors['bg-up-rev'];
      }
    }
    if (down) {
      if (hlUp) {
        return colors['bg-down-rev'];
      }
      if (hlDown) {
        return colors['bg-down-hl'];
      }
    }

    return 'auto';
  }} !important;
`;
