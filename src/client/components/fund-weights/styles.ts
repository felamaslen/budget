import { css } from '@emotion/react';
import styled from '@emotion/styled';
import { rem } from 'polished';
import { FlexCenter, FlexColumn } from '~client/styled/shared';
import { H4 } from '~client/styled/shared/typography';
import { colors } from '~client/styled/variables';

export const Label = styled.span<{ small: boolean }>(
  ({ small }) => css`
    color: ${colors.light.light};
    position: absolute;
    left: 50%;
    top: 50%;
    transform: translateX(-50%) translateY(-50%);
    white-space: nowrap;

    ${small &&
    css`
      color: ${colors.white};
      font-size: ${rem(10)};
      transform: translateX(-50%) translateY(-50%) rotate(-45deg);
      transform-origin: center center;
    `};
  `,
);

export const InfoDialog = styled(FlexColumn)`
  background: ${colors.shadow.mediumDark};
  border-radius: ${rem(5)};
  color: ${colors.white};
  font-size: ${rem(12)};
  margin: ${rem(10)};
  padding: ${rem(4)} ${rem(8)};

  th {
    text-align: left;
  }
  td {
    text-align: right;
  }

  ${H4} {
    margin: ${rem(4)} 0 ${rem(12)} 0;
  }
`;

export const InfoDialogRowRawValue = styled.tr`
  &,
  th {
    font-weight: normal;
  }
`;

export const InfoDialogRowDerived = styled(InfoDialogRowRawValue)`
  &,
  th {
    font-style: italic;
  }
`;

export const InfoDialogRowImportant = styled(InfoDialogRowDerived)`
  &,
  th {
    font-weight: bold;
  }
`;

export const InfoDialogBackground = styled(FlexCenter)`
  background: ${colors.shadow.light};
  height: 100%;
  justify-content: center;
  left: 0;
  position: absolute;
  top: 0;
  width: 100%;
`;

export const HelpButton = styled.div`
  bottom: 0;
  position: absolute;
  right: 0;
  z-index: 5;

  button {
    font-size: ${rem(9)};
    height: ${rem(21)};
    padding: 0 ${rem(5)};

    &,
    &:hover,
    &:active,
    &:focus {
      background: none;
      border: none;
      box-shadow: none;
    }
  }
`;
