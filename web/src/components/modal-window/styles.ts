import styled from 'styled-components';
import { breakpoint, rem } from '~client/styled/mixins';
import { colors, breakpoints } from '~client/styled/variables';

export const ModalWindow = styled.div<{ visible: boolean; width?: number }>`
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
    min-width: ${({ width = breakpoints.mobile }): string => rem(width)};
    top: 50%;
    transform: translateX(-50%) translateY(-50%);
    width: auto;
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
