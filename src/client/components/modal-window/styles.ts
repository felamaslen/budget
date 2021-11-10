import { css, SerializedStyles } from '@emotion/react';
import styled from '@emotion/styled';
import { rem } from 'polished';
import { breakpoint } from '~client/styled/mixins';
import { asLink, H2 } from '~client/styled/shared';
import { colors, breakpoints } from '~client/styled/variables';

export const closeTransitionTimeMs = 300;

export type ModalWindowProps = { visible: boolean; width?: number; fullSize?: boolean };
const modalWindowStyles = ({
  visible,
  width = breakpoints.mobile,
  fullSize = false,
}: ModalWindowProps): SerializedStyles => css`
  background: ${colors.shadow.mediumDark};
  display: flex;
  flex-flow: column;
  height: 100%;
  opacity: ${visible ? 1 : 0};
  position: absolute !important;
  transition: opacity ${closeTransitionTimeMs}ms ease-out;
  width: 100% !important;
  z-index: 100;

  ${breakpoint(breakpoints.mobile)} {
    background: ${colors.shadow.mediumLight};
    border-width: 2px 10px 0 10px;
    box-shadow: 0 2px 6px ${colors.shadow.mediumLight};
    ${fullSize
      ? `
      width: 100%;
      `
      : `
      left: 50%;
      height: auto;
      max-height: 90%;
      min-width: ${rem(width)};
      top: 50%;
      transform: translateX(-50%) translateY(-50%);
      width: auto !important;
      `}
  }
`;
export const ModalWindow = styled.div<ModalWindowProps>(modalWindowStyles);

export const Meta = styled.div`
  display: flex;
  flex: 0 0 24px;
  align-items: center;
  justify-content: center;
  position: relative;
  background: ${colors.shadow.mediumLight};
  color: ${colors.white};
`;

export const Title = styled(H2)`
  margin: 0 5px;
  font-size: 16px;
  font-weight: bold;
`;

export const BackButton = asLink(styled.a`
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
`);
