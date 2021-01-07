import { css } from '@emotion/react';
import styled from '@emotion/styled';
import { opacify, readableColor, rem } from 'polished';

import { ErrorLevel } from '~client/constants/error';
import { colors, sizes } from '~client/styled/variables';

export const MessageList = styled.ul`
  margin: 1em;
  z-index: 1001;
  position: fixed;
  top: ${sizes.navbarHeight}px;
  right: 0;
`;

const levelColor = (level: ErrorLevel): string => colors.messages[level] ?? colors.white;

export const Message = styled.li<{ closed?: boolean; level: ErrorLevel }>(
  ({ closed, level }) => css`
    background: ${levelColor(level)};
    border-radius: 0.3em;
    box-shadow: 0 3px 6px ${colors.shadow.light};
    color: ${readableColor(levelColor(level))};
    cursor: pointer;
    font-size: ${rem(13)};
    font-style: italic;
    margin-top: ${rem(8)};
    max-height: ${rem(110)};
    min-height: ${rem(48)};
    overflow: hidden;
    padding: ${rem(8)} ${rem(16)};
    position: relative;
    transition: 0.8s ease-in-out;
    width: ${rem(360)};

    &::before {
      background: linear-gradient(
        to bottom,
        transparent 0%,
        transparent ${rem(50)},
        ${opacify(1)(levelColor(level))} 100%
      );
      content: '';
      height: 100%;
      left: 0;
      position: absolute;
      top: 0;
      width: 100%;
    }

    &:hover {
      max-height: initial;
      &::before {
        opacity: 0;
      }
    }

    ${!!closed &&
    css`
      margin: 0;
      opacity: 0;
      height: 0;
    `}
  `,
);
