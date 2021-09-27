import { css, SerializedStyles } from '@emotion/react';
import styled from '@emotion/styled';
import { rem, rgba } from 'polished';

import { FormField } from '~client/components/form-field/styles';
import { ModalDialog } from '~client/components/modal-dialog/styles';
import { breakpoint } from '~client/styled/mixins';
import { breakpoints, colors } from '~client/styled/variables';

export const ModalHead = styled.div`
  ${breakpoint(breakpoints.mobile)} {
    display: flex;
    line-height: 24px;
    font-weight: bold;
    font-size: 14px;
  }
`;

export const ModalHeadColumn = styled.span`
  ${breakpoint(breakpoints.mobile)} {
    margin-left: 0;
    text-align: left;
  }
`;

// Col, Label, Fields only used on modal (mobile) dialog
export const ComponentCol = styled.span`
  flex: 1;
  padding-right: ${rem(4)};

  input {
    width: 100%;
  }
`;

export const ComponentFields = styled.div`
  flex: 1;
`;

export const ComponentRow = styled.div`
  ${ModalDialog} & {
    display: flex;
    flex-flow: row nowrap;
  }

  ${breakpoint(breakpoints.mobile)} {
    margin: 0;

    ${FormField} {
      width: 100% !important;
    }
  }
`;

export const ComponentRowButton = styled(ComponentRow)`
  ${ModalDialog} & {
    align-items: center;
    display: flex;
    flex: 0 0 ${rem(32)};
    justify-content: center;

    button {
      border-radius: 100%;
      flex: 0 0 ${rem(24)};
      height: ${rem(24)};
      margin: 0;
      padding: 0;
      width: ${rem(24)};
    }
  }
  ${breakpoint(breakpoints.mobile)} {
    button {
      margin-top: 3px;
    }
  }
`;

export const ComponentModal = styled.div`
  ${breakpoint(breakpoints.mobile)} {
    background: ${colors.translucent.light.mediumLight};
    border-right: 1px solid ${colors.light.mediumDark};
    border-bottom: 1px solid ${colors.light.mediumDark};
    box-shadow: 0 3px 6px ${colors.shadow.light};
    position: absolute;
    top: 100%;
    z-index: 5;

    ${FormField} {
      border: 1px solid ${colors.light.mediumLight};
      font-size: ${rem(14)};
      width: 100%;

      input {
        border-right: none;
        &:not(:last-child) {
          margin-right: ${rem(4)};
        }
      }
    }
  }
`;

export const ModalInner = styled.div`
  ${breakpoint(breakpoints.mobile)} {
    display: flex;
    flex-flow: column;
    max-height: ${rem(304)};
  }
`;

export const ComponentList = styled.ul`
  list-style: none;

  ${ModalDialog} & {
    font-size: 95%;
    padding: 0 0 ${rem(8)} ${rem(4)};
    margin: 0;
    width: 100%;
  }
  ${breakpoint(breakpoints.mobile)} {
    display: flex;
    margin: 0;
    padding: 0;
    flex-flow: column;
    max-height: ${rem(304)};
    overflow-y: auto;
  }
`;

export const ComponentListItem = styled.li<{ isDrip?: boolean }>(
  ({ isDrip }) => css`
    background: ${rgba(isDrip ? colors.profit.light : colors.white, 0.5)};

    ${ModalDialog} & {
      display: flex;
      flex-flow: row;

      & > div {
        display: flex;
        flex-flow: column;
      }

      &:not(:last-child) {
        padding-bottom: 3px;
        border-bottom: 1px dotted ${colors.light.mediumDark};
      }
    }

    ${breakpoint(breakpoints.mobile)} {
      display: flex;
      align-items: center;
      line-height: 24px;
      flex: 0 0 24px;

      &:not(:last-child) {
        border-bottom: 1px solid ${colors.light.mediumDark};
        padding-bottom: ${rem(2)};
      }

      input {
        padding: 0 0 0 1px;
        font-size: 12px;
        height: 22px;
        line-height: 22px;
        border: 1px solid #ccc;
        box-shadow: none;
      }

      ${FormField} {
        border: none;
      }
    }
  `,
);

export const componentItem = (width: number): SerializedStyles => css`
  ${breakpoint(breakpoints.mobile)} {
    flex: 0 0 ${width}px;

    &,
    ${ComponentCol}, input {
      width: ${width}px;
    }
  }
`;

export const InactiveToggleIndicator = styled.button<{ active?: boolean }>(
  ({ active }) => css`
    display: none;

    ${breakpoint(breakpoints.mobile)} {
      background: none;
      border: none;
      border-right: 1px solid ${colors.light.mediumDark};
      color: inherit;
      display: block;
      font: inherit;
      height: 100%;
      margin: 0;
      outline: none;
      padding: 0;
      text-align: center;
      width: 100%;

      &:focus {
        box-shadow: inset 0 0 1px 1px ${colors.blue};
      }

      ${active && `z-index: 1;`}
    }
  `,
);
