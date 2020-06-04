import { NavLink } from 'react-router-dom';
import styled from 'styled-components';
import { breakpoint, rem } from '~client/styled/mixins';
import { colors, breakpoints } from '~client/styled/variables';

export const NetWorth = styled.div<{ visible: boolean }>`
  background: ${colors.shadow.mediumDark};
  display: flex;
  flex-flow: column;
  height: 100%;
  opacity: ${({ visible }): number => (visible ? 1 : 0)};
  position: absolute;
  transition: opacity 0.3s ease-out;
  width: 100%;
  z-index: 100;

  ${breakpoint(breakpoints.mobile)} {
    background: ${colors.shadow.mediumLight};
    border-width: 2px 10px 0 10px;
    box-shadow: 0 2px 6px ${colors.shadow.mediumLight};
    left: 50%;
    height: auto;
    max-height: 90%;
    min-width: ${rem(breakpoints.mobile)};
    top: 50%;
    transform: translateX(-50%) translateY(-50%);
    width: auto;
  }
`;

export const TabBar = styled.div`
  display: flex;
  padding: 0 5px;
  flex: 0 0 22px;
  width: 100%;
`;

export const Tab = styled(NavLink)`
  display: inline-flex;
  align-items: center;
  margin: 0 5px;
  padding: 0 10px;
  line-height: 22px;
  background: ${colors.shadow.mediumLight};
  color: ${colors.white};
  text-decoration: none;
  border-radius: 0 0 6px 6px;

  &:hover,
  &:active {
    background: ${colors.black};
  }
  &.selected {
    background: ${colors.shadow.light};
    color: ${colors.light.mediumDark};
    cursor: default;
  }
`;

export const Meta = styled.div`
  display: flex;
  flex: 0 0 24px;
  align-items: center;
  justify-content: center;
  position: relative;
  background: ${colors.shadow.mediumLight};
  color: ${colors.white};
`;

export const Title = styled.h2`
  margin: 0 5px;
  font-size: 16px;
  font-weight: bold;
`;

export const BackButton = styled.a.attrs({
  role: 'link',
  tabIndex: 0,
})`
  display: block;
  position: absolute;
  right: 4px;
  width: 20px;
  height: 20px;
  text-align: center;
  font-size: 25px;
  line-height: 20px;
  text-decoration: none;
  color: black;
  background: rgba(190, 10, 10, 0.8);
  color: ${colors.white};
  cursor: pointer;
`;
